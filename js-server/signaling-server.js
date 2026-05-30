// signaling-server.js
//
// Minimal WebRTC signaling relay for the collaborative audio/video feature.
// Hardened: origin checks, strict message validation, size/rate/room limits,
// identity binding, heartbeats, and same-room-only relaying.
//
// SECURITY NOTE: this relay does NOT authenticate users. Room membership is by
// possession of the room id only. See docs/collaboration-security.md.

import { WebSocketServer } from 'ws'

// --- configuration (env, safe defaults) --------------------------------------
const WS_HOST = process.env.WS_HOST || '127.0.0.1'
const WS_PORT = Number(process.env.WS_PORT || 5174)
const WS_PATH = process.env.WS_PATH || '/ws'
const ALLOWED_ORIGINS = (process.env.WS_ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
// Allow non-browser clients (no Origin header) only when explicitly enabled.
const ALLOW_NO_ORIGIN = /^(1|true|yes)$/i.test(process.env.WS_ALLOW_NO_ORIGIN || '')

// --- limits ------------------------------------------------------------------
const MAX_PAYLOAD = 64 * 1024 // 64 KiB per message
const MAX_CONN_PER_IP = 20
const MAX_ROOM_SIZE = 12
const MSG_WINDOW_MS = 10 * 1000
const MSG_PER_WINDOW = 100
const IDLE_MS = 5 * 60 * 1000
const HEARTBEAT_MS = 30 * 1000
const MAX_SDP_CHARS = 100 * 1000
const MAX_CANDIDATE_CHARS = 4 * 1000
const ROOM_ID_RE = /^[A-Za-z0-9_-]{8,64}$/
const CLIENT_ID_RE = /^[A-Za-z0-9_-]{1,64}$/
const ALLOWED_TYPES = new Set(['join', 'offer', 'answer', 'ice-candidate'])

const rooms = new Map() // roomName -> Map<clientID, ws>
const ipCounts = new Map() // ip -> connection count

function originAllowed(origin) {
  if (!origin) return ALLOW_NO_ORIGIN
  return ALLOWED_ORIGINS.includes(origin)
}

const wss = new WebSocketServer({
  host: WS_HOST,
  port: WS_PORT,
  path: WS_PATH,
  maxPayload: MAX_PAYLOAD,
  verifyClient: (info, done) => {
    if (!originAllowed(info.origin)) {
      done(false, 403, 'Forbidden origin')
      return
    }
    done(true)
  },
})

function clientIp(req) {
  return (req.socket && req.socket.remoteAddress) || 'unknown'
}

function safeParse(raw) {
  if (typeof raw !== 'string') {
    // ws gives Buffer by default; coerce and bound length.
    raw = raw ? raw.toString('utf8') : ''
  }
  if (raw.length > MAX_PAYLOAD) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function normId(value) {
  if (typeof value === 'number' && Number.isFinite(value)) value = String(value)
  return typeof value === 'string' && CLIENT_ID_RE.test(value) ? value : null
}

function rateLimited(ws) {
  const now = Date.now()
  ws._msgTimes = (ws._msgTimes || []).filter((t) => now - t < MSG_WINDOW_MS)
  if (ws._msgTimes.length >= MSG_PER_WINDOW) return true
  ws._msgTimes.push(now)
  return false
}

function leaveRoom(ws) {
  const { _room: room, _id: id } = ws
  if (room && id && rooms.has(room)) {
    const members = rooms.get(room)
    if (members.get(id) === ws) members.delete(id)
    if (members.size === 0) rooms.delete(room)
  }
}

wss.on('connection', (ws, req) => {
  const ip = clientIp(req)
  const count = (ipCounts.get(ip) || 0) + 1
  if (count > MAX_CONN_PER_IP) {
    ws.close(1008, 'Too many connections')
    return
  }
  ipCounts.set(ip, count)

  ws._ip = ip
  ws._room = null
  ws._id = null
  ws._isAlive = true
  ws._lastActivity = Date.now()

  ws.on('pong', () => { ws._isAlive = true })

  ws.on('message', (raw) => {
    ws._lastActivity = Date.now()
    if (rateLimited(ws)) return

    const msg = safeParse(raw)
    if (!msg || typeof msg !== 'object' || Array.isArray(msg)) return
    if (!ALLOWED_TYPES.has(msg.type)) return

    if (msg.type === 'join') {
      if (ws._room) return // already joined; ignore re-join attempts
      if (!ROOM_ID_RE.test(msg.room || '')) return
      const id = normId(msg.from)
      if (!id) return

      let members = rooms.get(msg.room)
      if (!members) {
        members = new Map()
        rooms.set(msg.room, members)
      }
      if (members.size >= MAX_ROOM_SIZE) {
        ws.send(JSON.stringify({ type: 'error', reason: 'room-full' }))
        return
      }
      // Reject duplicate client ids rather than replacing the existing socket.
      if (members.has(id)) {
        ws.send(JSON.stringify({ type: 'error', reason: 'id-taken' }))
        return
      }

      // Bind identity to this socket. All later relays use ws._id as the
      // authoritative sender; a client-supplied "from" is never trusted again.
      ws._room = msg.room
      ws._id = id
      members.set(id, ws)

      const peers = Array.from(members.keys()).filter((k) => k !== id)
      ws.send(JSON.stringify({ type: 'peers-in-room', peers }))
      return
    }

    // Relay types require an established identity.
    if (!ws._room || !ws._id) return
    const to = normId(msg.to)
    if (!to) return

    // Bound SDP / ICE payload sizes.
    if (msg.type === 'offer' || msg.type === 'answer') {
      const sdp = msg.sdp && typeof msg.sdp === 'object' ? msg.sdp.sdp : undefined
      if (typeof sdp === 'string' && sdp.length > MAX_SDP_CHARS) return
    }
    if (msg.type === 'ice-candidate') {
      const cand = msg.candidate && typeof msg.candidate === 'object' ? msg.candidate.candidate : undefined
      if (typeof cand === 'string' && cand.length > MAX_CANDIDATE_CHARS) return
    }

    const members = rooms.get(ws._room)
    const target = members && members.get(to)
    if (!target || target.readyState !== target.OPEN) return

    // Rebuild the outgoing message with the server-verified sender identity.
    const outgoing = { type: msg.type, from: ws._id, to }
    if (msg.type === 'offer' || msg.type === 'answer') outgoing.sdp = msg.sdp
    if (msg.type === 'ice-candidate') outgoing.candidate = msg.candidate
    target.send(JSON.stringify(outgoing))
  })

  ws.on('close', () => {
    leaveRoom(ws)
    const c = (ipCounts.get(ip) || 1) - 1
    if (c <= 0) ipCounts.delete(ip)
    else ipCounts.set(ip, c)
  })

  ws.on('error', () => {
    try { ws.terminate() } catch { /* noop */ }
  })
})

// Heartbeat: terminate dead sockets.
const heartbeat = setInterval(() => {
  const now = Date.now()
  wss.clients.forEach((ws) => {
    if (ws._isAlive === false) {
      leaveRoom(ws)
      try { ws.terminate() } catch { /* noop */ }
      return
    }
    if (now - (ws._lastActivity || now) > IDLE_MS) {
      leaveRoom(ws)
      try { ws.close(1000, 'Idle timeout') } catch { /* noop */ }
      return
    }
    ws._isAlive = false
    try { ws.ping() } catch { /* noop */ }
  })
}, HEARTBEAT_MS)

wss.on('close', () => clearInterval(heartbeat))

console.log(`Signaling server listening on ${WS_HOST}:${WS_PORT}${WS_PATH}`)
