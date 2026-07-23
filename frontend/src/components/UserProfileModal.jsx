import { useState, useEffect } from "react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";
import Avatar from "./Avatar";

const UserProfileModal = ({ userId, onClose, onMessage }) => {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(null);
  const [isRequester, setIsRequester] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const toast = useToast();

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get(`/auth/users/${userId}`),
      api.get(`/connections/status/${userId}`),
    ])
      .then(([userRes, statusRes]) => {
        setUser(userRes.data.user);
        setStatus(statusRes.data.status);
        setIsRequester(statusRes.data.isRequester);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleSendRequest = async () => {
    setSending(true);
    try {
      await api.post("/connections", { recipientId: userId });
      toast.showToast("Connection request sent");
      load();
    } catch (err) {
      toast.showToast(err.response?.data?.message || "Failed to send request", "error");
    } finally {
      setSending(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal profile-modal" onClick={(e) => e.stopPropagation()}>
          <p className="empty-state small">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-modal-header">
          <Avatar name={user.name} color={user.avatarColor} isOnline={user.isOnline} size={64} />
          <h3>{user.name}</h3>
          <p className="profile-username">@{user.username}</p>
          <p className="profile-modal-status">
            {user.isOnline ? "Online" : `Last seen ${new Date(user.lastSeen).toLocaleDateString()}`}
          </p>
        </div>

        <div className="profile-modal-actions">
          {status === "none" && (
            <button className="btn-primary btn-full" onClick={handleSendRequest} disabled={sending}>
              {sending ? "Sending..." : "Send Connection Request"}
            </button>
          )}

          {status === "pending" && isRequester && (
            <p className="empty-state small">Connection request pending — waiting on their response.</p>
          )}

          {status === "pending" && !isRequester && (
            <p className="empty-state small">
              They've sent you a connection request — respond from your Profile page.
            </p>
          )}

          {status === "accepted" && <p className="connected-badge">✓ Connected</p>}

          {status === "rejected" && (
            <p className="empty-state small">This connection request was declined.</p>
          )}

          <button className="btn-secondary btn-full" onClick={() => onMessage?.(userId)}>
            Message
          </button>
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;