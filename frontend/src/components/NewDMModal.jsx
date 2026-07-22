import { useState, useEffect } from "react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";
import Avatar from "./Avatar";

const NewDMModal = ({ onClose, onStart }) => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectingIds, setConnectingIds] = useState({}); // userId -> 'sending' | 'sent'
  const toast = useToast();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true);
      api
        .get("/auth/users", { params: { search } })
        .then((res) => setUsers(res.data.users))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timeout);
  }, [search]);

  const handleConnect = async (e, userId) => {
    e.stopPropagation();
    setConnectingIds((prev) => ({ ...prev, [userId]: "sending" }));
    try {
      await api.post("/connections", { recipientId: userId });
      setConnectingIds((prev) => ({ ...prev, [userId]: "sent" }));
      toast.showToast("Connection request sent");
    } catch (err) {
      const message = err.response?.data?.message || "Failed to send request";
      toast.showToast(message, "error");
      if (message.toLowerCase().includes("already")) {
        setConnectingIds((prev) => ({ ...prev, [userId]: "sent" }));
      } else {
        setConnectingIds((prev) => {
          const next = { ...prev };
          delete next[userId];
          return next;
        });
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Start a Conversation</h3>
        <input
          className="modal-search-input"
          placeholder="Search by name or username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />

        <div className="user-search-list">
          {loading ? (
            <p className="empty-state small">Searching...</p>
          ) : users.length === 0 ? (
            <p className="empty-state small">No users found.</p>
          ) : (
            users.map((u) => (
              <div key={u._id} className="user-search-item">
                <button className="user-search-item-main" onClick={() => onStart(u._id)}>
                  <Avatar name={u.name} color={u.avatarColor} isOnline={u.isOnline} size={36} />
                  <div>
                    <p className="thread-name">{u.name}</p>
                    <p className="thread-meta">@{u.username}</p>
                  </div>
                </button>
                <button
                  className="btn-outline connect-btn"
                  disabled={connectingIds[u._id] === "sending" || connectingIds[u._id] === "sent"}
                  onClick={(e) => handleConnect(e, u._id)}
                >
                  {connectingIds[u._id] === "sent"
                    ? "Requested"
                    : connectingIds[u._id] === "sending"
                    ? "..."
                    : "Connect"}
                </button>
              </div>
            ))
          )}
        </div>

        <p className="modal-footnote">
          Tap a name to open a chat — your first message doubles as a connection request. Or use
          "Connect" to send a request without messaging.
        </p>
      </div>
    </div>
  );
};

export default NewDMModal;
