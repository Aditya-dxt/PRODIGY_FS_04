import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useToast } from "../context/ToastContext";
import ChatSidebar from "../components/ChatSidebar";
import ChatWindow from "../components/ChatWindow";
import CreateRoomModal from "../components/CreateRoomModal";
import NewDMModal from "../components/NewDMModal";
import RoomInfoModal from "../components/RoomInfoModal";
import JoinRoomModal from "../components/JoinRoomModal";
import UserProfileModal from "../components/UserProfileModal";

const threadKey = (type, id) => `${type}:${id}`;

const ChatPage = () => {
  const { user, logout } = useAuth();
  const { socket, presenceMap } = useSocket();
  const toast = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("rooms");
  const [rooms, setRooms] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [typingByThread, setTypingByThread] = useState({}); // key -> { userId: name }

  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showNewDM, setShowNewDM] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [infoModalRoomId, setInfoModalRoomId] = useState(null);
  const [viewProfileUserId, setViewProfileUserId] = useState(null);

  const selectedThreadRef = useRef(selectedThread);
  selectedThreadRef.current = selectedThread;

  const loadRooms = useCallback(() => {
    api.get("/rooms").then((res) => setRooms(res.data.rooms));
  }, []);

  const loadConversations = useCallback(() => {
    api
      .get("/conversations")
      .then((res) => setConversations(res.data.conversations));
  }, []);

  useEffect(() => {
    loadRooms();
    loadConversations();
  }, [loadRooms, loadConversations]);

  // ---- Load message history whenever the selected thread changes ----
  // Rooms are request-based to join now — this just fetches whatever the
  // backend allows (full history for members, a 24h read-only preview otherwise).
  useEffect(() => {
    if (!selectedThread) return;

    const key = threadKey(selectedThread.type, selectedThread.id);
    setUnreadCounts((prev) => ({ ...prev, [key]: 0 }));

    const endpoint =
      selectedThread.type === "room"
        ? `/messages/room/${selectedThread.id}`
        : `/messages/conversation/${selectedThread.id}`;

    api.get(endpoint).then((res) => {
      setMessages(res.data.messages);
      setIsReadOnly(!!res.data.readOnly);
    });

    if (selectedThread.type === "room") {
      // Anyone can subscribe to receive live updates for the preview window,
      // even non-members — sending is still gated separately.
      socket?.emit("room:subscribe", selectedThread.id);
    }
  }, [selectedThread, socket]);

  // ---- Global socket listeners ----
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = ({ type, roomId, conversationId, message }) => {
      const id = type === "room" ? roomId : conversationId;
      const key = threadKey(type, id);
      const current = selectedThreadRef.current;
      const isActiveThread =
        current && current.type === type && current.id === id;

      if (isActiveThread) {
        setMessages((prev) => [...prev, message]);
      } else {
        setUnreadCounts((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
        if (message.sender?._id !== user.id) {
          toast.showToast(`New message from ${message.sender?.name}`, "info");
        }
      }

      if (type === "dm") loadConversations();
    };

    const handleTyping = ({ userId, name, type, targetId, isTyping }) => {
      const key = threadKey(type, targetId);
      setTypingByThread((prev) => {
        const threadTyping = { ...(prev[key] || {}) };
        if (isTyping) {
          threadTyping[userId] = name;
        } else {
          delete threadTyping[userId];
        }
        return { ...prev, [key]: threadTyping };
      });
    };

    socket.on("message:new", handleNewMessage);
    socket.on("typing:update", handleTyping);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("typing:update", handleTyping);
    };
  }, [socket, user, toast, loadConversations]);

  const handleSend = ({ content, attachment }) => {
    if (!selectedThread || !socket) return;
    socket.emit(
      "message:send",
      {
        type: selectedThread.type,
        targetId: selectedThread.id,
        content,
        attachment,
      },
      (ack) => {
        if (!ack?.success) {
          toast.showToast(ack?.message || "Failed to send message", "error");
        }
      },
    );
  };

  const handleTypingStart = () => {
    if (!selectedThread || !socket || isReadOnly) return;
    socket.emit("typing:start", {
      type: selectedThread.type,
      targetId: selectedThread.id,
    });
  };

  const handleTypingStop = () => {
    if (!selectedThread || !socket) return;
    socket.emit("typing:stop", {
      type: selectedThread.type,
      targetId: selectedThread.id,
    });
  };

  const handleCreateRoom = async ({ name, description }) => {
    const res = await api.post("/rooms", { name, description });
    loadRooms();
    setSelectedThread({
      type: "room",
      id: res.data.room._id,
      name: res.data.room.name,
      isMember: true,
    });
    setActiveTab("rooms");
  };

  const handleStartDM = async (targetUserId) => {
    const res = await api.post("/conversations", { userId: targetUserId });
    loadConversations();
    const otherUser = res.data.conversation.participants.find(
      (p) => p._id !== user.id,
    );
    setSelectedThread({
      type: "dm",
      id: res.data.conversation._id,
      name: otherUser?.name,
      otherUser,
    });
    setActiveTab("dms");
    setShowNewDM(false);
    setViewProfileUserId(null);
  };

  // Called after finding a room by code — opens its info panel so the user
  // can read the description and send a join request from there.
  const handleRoomFoundByCode = (room) => {
    setInfoModalRoomId(room._id);
  };

  // Called by RoomInfoModal whenever something changes (request sent,
  // request accepted/rejected) so the sidebar's counts/labels stay fresh.
  const handleRoomInfoChange = () => {
    loadRooms();
    if (selectedThreadRef.current?.type === "room") {
      api.get(`/messages/room/${selectedThreadRef.current.id}`).then((res) => {
        setMessages(res.data.messages);
        setIsReadOnly(!!res.data.readOnly);
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const activeKey = selectedThread
    ? threadKey(selectedThread.type, selectedThread.id)
    : null;
  const typingNames = activeKey
    ? Object.values(typingByThread[activeKey] || {})
    : [];

  return (
    <div className="chat-app">
      <ChatSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        rooms={rooms}
        conversations={conversations}
        selectedThread={selectedThread}
        onSelectThread={setSelectedThread}
        presenceMap={presenceMap}
        unreadCounts={unreadCounts}
        onOpenCreateRoom={() => setShowCreateRoom(true)}
        onOpenJoinRoom={() => setShowJoinRoom(true)}
        onOpenRoomInfo={(roomId) => setInfoModalRoomId(roomId)}
        onOpenNewDM={() => setShowNewDM(true)}
        currentUser={user}
        onLogout={handleLogout}
        onViewProfile={(userId) => setViewProfileUserId(userId)}
      />

      <ChatWindow
        thread={selectedThread}
        messages={messages}
        isReadOnly={isReadOnly}
        currentUserId={user.id}
        onSend={handleSend}
        onTypingStart={handleTypingStart}
        onTypingStop={handleTypingStop}
        typingNames={typingNames}
        presenceMap={presenceMap}
        onOpenRoomInfo={(roomId) => setInfoModalRoomId(roomId)}
        onViewProfile={(userId) => setViewProfileUserId(userId)}
      />

      {showCreateRoom && (
        <CreateRoomModal
          onClose={() => setShowCreateRoom(false)}
          onCreate={handleCreateRoom}
        />
      )}
      {showNewDM && (
        <NewDMModal
          onClose={() => setShowNewDM(false)}
          onStart={handleStartDM}
          onViewProfile={(userId) => {
            setShowNewDM(false);
            setViewProfileUserId(userId);
          }}
        />
      )}
      {showJoinRoom && (
        <JoinRoomModal
          onClose={() => setShowJoinRoom(false)}
          onFound={handleRoomFoundByCode}
        />
      )}
      {infoModalRoomId && (
        <RoomInfoModal
          roomId={infoModalRoomId}
          onClose={() => setInfoModalRoomId(null)}
          onRequestSent={handleRoomInfoChange}
          onRoomChange={handleRoomInfoChange}
        />
      )}
      {viewProfileUserId && (
        <UserProfileModal
          userId={viewProfileUserId}
          onClose={() => setViewProfileUserId(null)}
          onMessage={handleStartDM}
        />
      )}
    </div>
  );
};

export default ChatPage;
