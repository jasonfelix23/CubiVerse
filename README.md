![Character movement demo](https://github.com/user-attachments/assets/68767a0c-fb36-4ec0-9f87-f6a103cf6cce)

## Overview  
This repository implements a multiplayer “room” experience with a 2D map, live sprite movement, chat, and early WebRTC signaling for richer real-time features.  
The backend is built with Spring WebSocket endpoints, while the frontend uses React/Next.js and a small custom hook to manage RTC signaling over WebSockets.

## Current Features

### Map and movement

- 2D map rendering with multiple player sprites.  
- Real-time movement updates over WebSockets, so other players see characters moving smoothly around the map.

### Chat

- Room-based chat over WebSockets.  
- Messages broadcast to all connected clients in the same room, giving a shared “lobby” feel.

### RTC signaling foundation

- Backend RTC WebSocket handler that supports `join`, `offer`, `answer`, `ice`, and `leave` actions.  
- In-memory room service that tracks which WebSocket sessions belong to which room and which user ID, and broadcasts peer updates.  
- Frontend `useRtcSocket` hook that connects to `/ws/rtc`, tracks connection status, and exposes a `send` function for JSON RTC messages.

## How the pieces fit together

- When a client joins a room, the backend registers its WebSocket session with a room and user ID, and sends back the list of existing peers.  
- Sprite movement and chat messages are pushed over dedicated WebSocket channels, keeping gameplay and communication responsive.  
- The RTC signaling channel is ready to carry offers/answers/ICE between peers, laying the groundwork for audio/video or data channels on top.
