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
  const [unreadCounts, setUnreadCounts] = useState({});
  const [typingByThread, setTypingByThread] = useState({}); // key -> { userId: name }
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showNewDM, setShowNewDM] = useState(false);

  const selectedThreadRef = useRef(selectedThread);
  selectedThreadRef.current = selectedThread;

  const loadRooms = useCallback(() => {
    api.get("/rooms").then((res) => setRooms(res.data.rooms));
  }, []);

  const loadConversations = useCallback(() => {
    api.get("/conversations").then((res) => setConversations(res.data.conversations));
  }, []);

  useEffect(() => {
    loadRooms();
    loadConversations();
  }, [loadRooms, loadConversations]);

  // ---- Load message history whenever the selected thread changes ----
  useEffect(() => {
    if (!selectedThread) return;

    const key = threadKey(selectedThread.type, selectedThread.id);
    setUnreadCounts((prev) => ({ ...prev, [key]: 0 }));

    const loadThread = async () => {
      // Clicking a room you're not a member of joins it first — same
      // "public rooms, tap to join" pattern most chat apps use.
      if (selectedThread.type === "room" && selectedThread.isMember === false) {
        try {
          await api.post(`/rooms/${selectedThread.id}/join`);
          loadRooms();
        } catch (err) {
          toast.showToast(err.response?.data?.message || "Failed to join room", "error");
          return;
        }
      }

      const endpoint =
        selectedThread.type === "room"
          ? `/messages/room/${selectedThread.id}`
          : `/messages/conversation/${selectedThread.id}`;

      const res = await api.get(endpoint);
      setMessages(res.data.messages);

      if (selectedThread.type === "room") {
        socket?.emit("room:subscribe", selectedThread.id);
      }
    };

    loadThread();
  }, [selectedThread, socket, loadRooms, toast]);

  // ---- Global socket listeners ----
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = ({ type, roomId, conversationId, message }) => {
      const id = type === "room" ? roomId : conversationId;
      const key = threadKey(type, id);
      const current = selectedThreadRef.current;
      const isActiveThread = current && current.type === type && current.id === id;

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
      }
    );
  };

  const handleTypingStart = () => {
    if (!selectedThread || !socket) return;
    socket.emit("typing:start", { type: selectedThread.type, targetId: selectedThread.id });
  };

  const handleTypingStop = () => {
    if (!selectedThread || !socket) return;
    socket.emit("typing:stop", { type: selectedThread.type, targetId: selectedThread.id });
  };

  const handleCreateRoom = async ({ name, description }) => {
    const res = await api.post("/rooms", { name, description });
    loadRooms();
    setSelectedThread({ type: "room", id: res.data.room._id, name: res.data.room.name });
    setActiveTab("rooms");
  };

  const handleStartDM = async (targetUserId) => {
    const res = await api.post("/conversations", { userId: targetUserId });
    loadConversations();
    setSelectedThread({
      type: "dm",
      id: res.data.conversation._id,
      name: res.data.conversation.participants.find((p) => p._id !== user.id)?.name,
      otherUser: res.data.conversation.participants.find((p) => p._id !== user.id),
    });
    setActiveTab("dms");
    setShowNewDM(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const activeKey = selectedThread ? threadKey(selectedThread.type, selectedThread.id) : null;
  const typingNames = activeKey ? Object.values(typingByThread[activeKey] || {}) : [];

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
        onOpenNewDM={() => setShowNewDM(true)}
        currentUser={user}
        onLogout={handleLogout}
      />

      <ChatWindow
        thread={selectedThread}
        messages={messages}
        currentUserId={user.id}
        onSend={handleSend}
        onTypingStart={handleTypingStart}
        onTypingStop={handleTypingStop}
        typingNames={typingNames}
        presenceMap={presenceMap}
      />

      {showCreateRoom && (
        <CreateRoomModal onClose={() => setShowCreateRoom(false)} onCreate={handleCreateRoom} />
      )}
      {showNewDM && <NewDMModal onClose={() => setShowNewDM(false)} onStart={handleStartDM} />}
    </div>
  );
};

export default ChatPage;