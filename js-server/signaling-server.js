import { WebSocketServer } from 'ws'

const wss = new WebSocketServer({ port: 5174, path: '/ws' })
const rooms = new Map()  // roomName → Map<clientID, ws>

wss.on('connection', (ws) => {
  let roomName = null
  let clientID = null

  ws.on('message', raw => {
    let msg
    try {
      msg = JSON.parse(raw)
    } catch {
      return
    }

    switch (msg.type) {
      case 'join':
        // client tells us its Yjs awareness.clientID and room
        clientID = msg.from
        roomName = msg.room
        if (!rooms.has(roomName)) {
          rooms.set(roomName, new Map())
        }
        // register this socket under its clientID
        rooms.get(roomName).set(clientID, ws)

        // reply with all *other* clientIDs in the room
        const peers = Array.from(rooms.get(roomName).keys())
                          .filter(id => id !== clientID)
        ws.send(JSON.stringify({ type: 'peers-in-room', peers }))
        break

      case 'offer':
      case 'answer':
      case 'ice-candidate':
        // forward raw message only to the intended recipient
        const target = rooms.get(roomName)?.get(msg.to)
        if (target && target.readyState === target.OPEN) {
          target.send(raw)
        }
        break
    }
  })

  ws.on('close', () => {
    if (roomName && clientID && rooms.has(roomName)) {
      rooms.get(roomName).delete(clientID)
      if (rooms.get(roomName).size === 0) rooms.delete(roomName)
    }
  })
})

console.log('Signaling server listening on ws://localhost:5174/ws')
