<div align="center">

# 💬 Pulse
### Conversations That Move at the Speed of Now

**A full-stack MERN real-time chat application built on WebSockets — group rooms, private messages, live presence, typing indicators, and file sharing, all delivered instantly.**

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)

</div>

---

## 🖼️ Preview

> *(Drop screenshots of the landing page, the chat interface, and a room/DM in action here)*

![Pulse Preview](frontend/public/preview.png)

---

## 🧩 What Is Pulse?

**Pulse** is a real-time messaging application where messages actually arrive in real time — not via polling or manual refresh, but over a persistent WebSocket connection using **Socket.IO**.

Every previous task in this internship has been a stateless REST API: request comes in, response goes out, done. This one is architecturally different — the client and server maintain an open connection for as long as the user is active, which is what makes instant delivery, live presence, and typing indicators possible at all.

Users can join **group rooms** for open conversations, or start **private one-on-one conversations** with any other user. Every message — whether text, an image, or a file — is persisted to MongoDB, so chat history survives reloads and reconnects.

---

## ✨ Features

### ⚡ Real-Time Core
- WebSocket-based instant messaging via Socket.IO, authenticated with the same JWT used for REST calls
- Both **group rooms** (create, join, leave) and **private DMs** (start a conversation with any user)
- Full chat history persisted in MongoDB and loaded on entering a thread

### 🟢 Presence & Activity
- Live online/offline indicators, accurate even across multiple open tabs (a user only shows offline once *every* tab has disconnected)
- Typing indicators scoped to the exact room or DM being viewed
- In-app toast notifications for new messages arriving in threads you're not currently viewing, plus unread badges in the sidebar

### 📎 File Sharing
- Upload images or files directly into a conversation
- Images render inline; other file types appear as a downloadable link

### 🔐 Security
- JWT authentication reused from a proven pattern, including for the socket handshake itself — a socket connection is rejected if the token is missing or invalid
- Room membership and DM participation are verified server-side before any message is accepted, not just trusted from the client

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
│   │   ├── messageController.js
│   │   └── uploadController.js
│   ├── middleware/authMiddleware.js
│   ├── models/ (User, Room, Conversation, Message)
│   ├── routes/
│   ├── sockets/socketHandler.js   ← the real-time engine
│   ├── uploads/                    ← uploaded chat attachments
│   ├── server.js                   ← Express + Socket.IO on one HTTP server
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/axios.js
    │   ├── context/ (AuthContext, SocketContext, ToastContext)
    │   ├── components/ (ChatSidebar, ChatWindow, MessageBubble, MessageInput, ...)
    │   ├── pages/ (LandingPage, AuthPage, ChatPage)
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
| Group rooms (create/join/leave) | ✅ Done |
| Private 1-on-1 conversations | ✅ Done |
| Chat history persistence | ✅ Done |
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

### 3. Try it out
Open two different browsers (or one regular + one incognito window) and sign up as two different users. Create a room in one, watch it require the other user to join separately. Start a DM between them and watch messages, typing indicators, and presence update instantly across both windows.

---

## API Endpoints (REST — used for setup, history, and uploads)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new account | No |
| POST | `/api/auth/login` | Log in and receive a JWT | No |
| GET | `/api/auth/me` | Get the current logged-in user | Yes |
| GET | `/api/auth/users?search=` | Search users to start a DM | Yes |
| GET | `/api/rooms` | List all rooms | Yes |
| POST | `/api/rooms` | Create a room | Yes |
| POST | `/api/rooms/:id/join` | Join a room | Yes |
| POST | `/api/rooms/:id/leave` | Leave a room | Yes |
| GET | `/api/conversations` | List your DM threads | Yes |
| POST | `/api/conversations` | Get or create a DM with a user | Yes |
| GET | `/api/messages/room/:roomId` | Room message history | Yes |
| GET | `/api/messages/conversation/:id` | DM message history | Yes |
| POST | `/api/upload` | Upload an image/file attachment | Yes |

## Socket.IO Events (real-time layer)

| Event | Direction | Payload |
|---|---|---|
| `message:send` | Client → Server | `{ type, targetId, content, attachment }` |
| `message:new` | Server → Client | `{ type, roomId/conversationId, message }` |
| `typing:start` / `typing:stop` | Client → Server | `{ type, targetId }` |
| `typing:update` | Server → Client | `{ userId, name, type, targetId, isTyping }` |
| `presence:update` | Server → Client | `{ userId, isOnline, lastSeen }` |
| `room:subscribe` / `room:unsubscribe` | Client → Server | `roomId` |

---

## ⚠️ Known Limitation: File Storage on Free Hosting

Uploaded files are stored on local disk via Multer. This works perfectly for local development and for a persistent server. However, **Render's free tier has an ephemeral filesystem** — uploaded files will be lost whenever the service restarts or redeploys. For a production-grade version, swapping the storage layer for **Cloudinary** or **AWS S3** would be the natural next step; the upload controller is isolated enough that this would only require changing `uploadController.js`, not the rest of the app.

---

## 🔮 Next Steps

1. Add real screenshots/GIF of the chat interface in action
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
