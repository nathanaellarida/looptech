// collab.js
//
// Shared helpers for the collaborative coding modes: signaling URLs and
// cryptographically strong room identifiers.
//
// SECURITY NOTE: a room link is a bearer capability, NOT authentication. Anyone
// who obtains the link can join. Do not describe rooms as "private" until
// authenticated membership is implemented. See docs/collaboration-security.md.

// Manual audio/video signaling (our own ws relay). Prefer an explicit public
// URL; otherwise derive ws:// vs wss:// from the page protocol.
export function getSignalingUrl() {
  const configured =
    typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SIGNALING_URL
  if (configured) return configured
  const loc = typeof window !== 'undefined' ? window.location : { protocol: 'http:', hostname: 'localhost' }
  const proto = loc.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = loc.hostname || 'localhost'
  return `${proto}//${host}:5174/ws`
}

// y-webrtc uses its OWN signaling. By default this is a PUBLIC server, meaning
// document contents are visible to anyone who knows the room id. We make that
// dependency explicit and configurable rather than relying on a silent default.
const DEFAULT_PUBLIC_YJS_SIGNALING = ['wss://y-webrtc-eu.fly.dev']
export function getYjsSignaling() {
  const raw =
    typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_YWEBRTC_SIGNALING
  if (raw) return raw.split(',').map((s) => s.trim()).filter(Boolean)
  return DEFAULT_PUBLIC_YJS_SIGNALING.slice()
}

// 128-bit, URL-safe room id from a CSPRNG (replaces Math.random).
export function createRoomId() {
  const c = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined
  if (c && typeof c.randomUUID === 'function') {
    return c.randomUUID().replace(/-/g, '')
  }
  const bytes = new Uint8Array(16)
  if (c && typeof c.getRandomValues === 'function') c.getRandomValues(bytes)
  let hex = ''
  for (let i = 0; i < bytes.length; i++) hex += ('0' + bytes[i].toString(16)).slice(-2)
  return hex
}

export const ROOM_ID_RE = /^[A-Za-z0-9_-]{8,64}$/
export function isValidRoomId(id) {
  return typeof id === 'string' && ROOM_ID_RE.test(id)
}

// Build an invite URL with proper URL encoding.
export function buildInviteUrl(roomId) {
  const loc = window.location
  const query = new URLSearchParams({ room: roomId })
  return `${loc.origin}${loc.pathname}?${query.toString()}`
}
