# Collaboration & real-time media — security notes

This document records the security posture and **known limitations** of the
collaborative coding modes (CodingCompete, CodingCollab) and the solo editor.

## Room links are capabilities, not authentication

Room IDs are generated with a CSPRNG (`crypto.randomUUID` / `getRandomValues`,
≥128 bits — see `src/challenges/collab.js`) so they are unguessable. However,
**anyone who obtains a room link can join that room.** A link is a bearer
capability, not proof of identity or authorization.

Do **not** describe rooms as "private" in the UI or docs until authenticated
room membership is implemented. Real authorization requires:

- Authenticated users (see the authentication residual risk in `SECURITY.md`).
- Server-enforced membership (a join must be checked against an allow-list that
  the server maintains, not merely possession of the room id).

## Signaling servers

There are two independent signaling paths:

1. **Yjs document sync (`y-webrtc`)** — uses its *own* signaling servers. By
   default `y-webrtc` points at a **public** signaling server, which means the
   document contents are reachable by anyone who knows the room id. We make this
   dependency explicit and configurable via `VITE_YWEBRTC_SIGNALING`
   (comma-separated list). **For any non-demo deployment, host your own
   signaling server** and set this variable; do not rely on the public default.

2. **Audio/video signaling (`js-server/signaling-server.js`)** — our own relay.
   It is hardened (origin allow-list, strict message schema + type allow-list,
   payload/rate/room/connection limits, identity binding so a client cannot spoof
   the `from` field, duplicate-id rejection, heartbeats and idle cleanup) but it
   **does not authenticate users**. Configure it with `WS_HOST`, `WS_PORT`,
   `WS_PATH`, and `WS_ALLOWED_ORIGINS`.

## Media privacy

- Camera and microphone are started **only** by an explicit user action (the
  Cam/Mic buttons). No media is captured on page load.
- While the camera is on, frames are periodically sent to the emotion-detection
  server; this is disclosed in the UI.
- All `MediaStream` tracks, capture timers, peer connections, and sockets are
  stopped on toggle-off and on component unmount.

## Residual risks

- No authenticated room membership (tracked as a product decision).
- Default `y-webrtc` public signaling until a self-hosted server is configured.
- Peer-to-peer WebRTC exposes participant IP addresses to each other (inherent
  to WebRTC); use a TURN relay if this matters for your threat model.
