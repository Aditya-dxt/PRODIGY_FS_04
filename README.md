<div align="center">

# 💬 Pulse
### Conversations That Move at the Speed of Now

**A full-stack MERN real-time chat application built on WebSockets — group rooms with admin-approved join requests, connection-gated direct messages, live presence, typing indicators, and file sharing.**

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)

</div>

---

## 🖼️ Preview

> *(Drop screenshots of the landing page, the chat interface, and the room/connection request flows here)*

![Pulse Preview](frontend/public/preview.png)

---

## 🧩 What Is Pulse?

**Pulse** is a real-time messaging application where messages arrive instantly over a persistent WebSocket connection using **Socket.IO** — not polling, not manual refresh.

Beyond the core chat brief, Pulse models two real trust systems most messaging apps have but tutorials skip:

**Connection-gated DMs.** Every user gets a unique, searchable **username** at signup. Messaging a stranger for the first time doubles as a connection request — you get exactly one message before you need their approval to continue. They accept or decline from their **Profile** page; declining permanently blocks further messages from that sender.

**Request-based rooms.** Every room has a unique **join code**. Anyone can search for a room by code and request to join — the room's original creator (its admin) reviews and approves or rejects each request individually from the room's info panel. Until you're a member, you can still preview a room's **last 24 hours of messages** in a read-only view, so you know what you're requesting to join before you commit.

---

## ✨ Features

### ⚡ Real-Time Core
- WebSocket-based instant messaging via Socket.IO, authenticated with the same JWT used for REST calls
- Group rooms and private DMs, both fully persisted in MongoDB
- Full chat history loaded on entering a thread

### 🔐 Connections (Direct Messages)
- Unique username required at signup, searchable independent of full name
- First message to a stranger = automatic connection request
- A second message is blocked until the recipient accepts (or permanently blocked if they decline)
- Dedicated **Profile** page showing all incoming connection requests with Accept/Decline
- Explicit "Connect" button in the new-message search modal, for requesting a connection without messaging first

### 🏷️ Rooms
- Every room gets a unique, shareable join code
- Search for any room by code and send a join request
- Only the room's creator (admin) can approve or reject join requests, from a dedicated room-info panel
- **Popular-rooms-until-joined rule:** a user in zero rooms sees the platform's most-populated rooms as suggestions; the moment they join one, they only ever see the rooms they've actually joined
- Non-members get a **24-hour read-only preview** of a room's activity — visible, but the message input is locked until they're approved

### 🟢 Presence & Activity
- Live online/offline indicators, accurate even across multiple open tabs
- Typing indicators scoped to the exact room or DM being viewed
- In-app toast notifications for new messages in threads you're not currently viewing, plus unread badges (with a separate badge style for admins with pending room requests)

### 📎 File Sharing
- Upload images or files directly into a conversation
- Images render inline with a graceful fallback if a file becomes unavailable; other file types appear as a downloadable link

### 🎨 Design
- Animated, modern landing page with floating message bubbles and pulse-ring animations
- Clean light-themed chat interface: sidebar with tabbed rooms/DMs, message bubbles styled by sender, animated typing dots

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 · Vite · React Router · Socket.IO Client · Axios |
| **Backend** | Node.js · Express · Socket.IO · Mongoose |
| **Database** | MongoDB (Atlas) |
| **Auth** | JSON Web Tokens · bcryptjs |
| **File Uploads** | Multer (local disk storage) |

---

## 📂 Project Structure
```
PRODIGY_FS_04/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── roomController.js
│   │   ├── conversationController.js
│   │   ├── connectionController.js
│   │   ├── messageController.js
│   │   └── uploadController.js
│   ├── middleware/authMiddleware.js
│   ├── models/ (User, Room, Conversation, Message, Connection)
│   ├── routes/
│   ├── sockets/socketHandler.js   ← the real-time engine + DM connection gating
│   ├── uploads/                    ← uploaded chat attachments
│   ├── server.js                   ← Express + Socket.IO on one HTTP server
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/axios.js
    │   ├── utils/fileUrl.js        ← resolves attachment URLs to the backend origin
    │   ├── context/ (AuthContext, SocketContext, ToastContext)
    │   ├── components/ (ChatSidebar, ChatWindow, RoomInfoModal, JoinRoomModal, NewDMModal, ...)
    │   ├── pages/ (LandingPage, AuthPage, ChatPage, ProfilePage)
    │   ├── App.jsx
    │   └── index.css
    ├── vercel.json
    └── .env.example
```

---

## 📊 Project Status

| Area | Status |
|---|---|
| WebSocket messaging (Socket.IO) | ✅ Done |
| Group rooms with join codes | ✅ Done |
| Admin-approved room join requests | ✅ Done |
| Popular-rooms-until-joined suggestion rule | ✅ Done |
| 24-hour read-only room preview for non-members | ✅ Done |
| Unique usernames | ✅ Done |
| Connection-gated direct messages | ✅ Done |
| Profile page with connection request inbox | ✅ Done |
| Live presence (online/offline) | ✅ Done |
| Typing indicators | ✅ Done |
| In-app notifications + unread badges | ✅ Done |
| File/image sharing | ✅ Done |
| Animated landing page | ✅ Done |
| Deployment | ⏳ Optional |

---

## 🚀 Run It Locally

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env       # fill in your real MONGO_URI and JWT_SECRET
npm run dev                 # → http://localhost:5000 (HTTP + WebSocket on the same port)
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev                  # → http://localhost:5173
```

### 3. Try the full flow
Open two different browser sessions (e.g. a normal window + an incognito window) and sign up as two different users, each with a unique username.

**Test DMs:** search for the other user by username, send one message — confirm a second message is blocked. Log in as the recipient, go to Profile, accept the request, confirm messaging now works freely both ways.

**Test rooms:** create a room as User A, note its join code. As User B, use "Join by Code," find the room, and confirm you can preview its last 24 hours read-only. Send a join request. Switch back to User A, open the room's info panel, approve the request. Confirm User B can now send messages.

---

## API Endpoints (REST — used for setup, history, and uploads)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new account (requires unique username) | No |
| POST | `/api/auth/login` | Log in and receive a JWT | No |
| GET | `/api/auth/me` | Get the current logged-in user | Yes |
| GET | `/api/auth/users?search=` | Search users by name or username | Yes |
| GET | `/api/rooms` | List rooms (popular suggestions or your own, per the join rule) | Yes |
| GET | `/api/rooms/search?code=` | Find a room by its join code | Yes |
| POST | `/api/rooms` | Create a room | Yes |
| GET | `/api/rooms/:id` | Room detail — description, code, join requests (if admin) | Yes |
| POST | `/api/rooms/:id/request` | Send a join request | Yes |
| PATCH | `/api/rooms/:id/requests/:userId` | Accept/reject a join request (admin only) | Yes |
| GET | `/api/conversations` | List your DM threads, with connection status | Yes |
| POST | `/api/conversations` | Get or create a DM with a user | Yes |
| GET | `/api/connections/requests` | List incoming connection requests | Yes |
| POST | `/api/connections` | Send a connection request explicitly | Yes |
| PATCH | `/api/connections/:id` | Accept/reject a connection request | Yes |
| GET | `/api/messages/room/:roomId` | Room history (full for members, 24h preview otherwise) | Yes |
| GET | `/api/messages/conversation/:id` | DM message history | Yes |
| POST | `/api/upload` | Upload an image/file attachment | Yes |

## Socket.IO Events (real-time layer)

| Event | Direction | Payload |
|---|---|---|
| `message:send` | Client → Server | `{ type, targetId, content, attachment }` — DM sends are gated by connection status server-side |
| `message:new` | Server → Client | `{ type, roomId/conversationId, message }` |
| `typing:start` / `typing:stop` | Client → Server | `{ type, targetId }` |
| `typing:update` | Server → Client | `{ userId, name, type, targetId, isTyping }` |
| `presence:update` | Server → Client | `{ userId, isOnline, lastSeen }` |
| `room:subscribe` / `room:unsubscribe` | Client → Server | `roomId` (open to non-members too, for the read-only preview) |

---

## ⚠️ Known Limitation: File Storage on Free Hosting

Uploaded files are stored on local disk via Multer. This works perfectly for local development and for a persistent server. However, **Render's free tier has an ephemeral filesystem** — uploaded files will be lost whenever the service restarts or redeploys. For a production-grade version, swapping the storage layer for **Cloudinary** or **AWS S3** would be the natural next step; the upload controller is isolated enough that this would only require changing `uploadController.js`, not the rest of the app.

---

## 🔮 Next Steps

1. Add real screenshots/GIF of the chat interface, connection requests, and room approval flow in action
2. Optional: migrate file storage to Cloudinary for persistent uploads on free hosting
3. Optional: message read receipts, message editing/deletion
4. Optional: deploy backend to Render and frontend to Vercel

---

## 📄 License

MIT — open source and free to use.

---

<div align="center">
  Built for the Full-Stack Web Development Internship at Prodigy InfoTech 💬<br/>
  by <a href="https://github.com/Aditya-dxt">Aditya Dixit</a>
</div>
