import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Avatar from "../components/Avatar";

const ProfilePage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = () => {
    api.get("/connections/requests").then((res) => setRequests(res.data.requests));
  };

  useEffect(() => {
    loadRequests();
    setLoading(false);
  }, []);

  const respond = async (id, action) => {
    try {
      await api.patch(`/connections/${id}`, { action });
      toast.showToast(action === "accept" ? "Connection accepted!" : "Request declined");
      loadRequests();
    } catch (err) {
      toast.showToast(err.response?.data?.message || "Failed to respond", "error");
    }
  };

  return (
    <div className="profile-page">
      <Link to="/chat" className="back-link">← Back to Chat</Link>

      <div className="profile-header">
        <Avatar name={user?.name} color={user?.avatarColor} size={64} />
        <div>
          <h1>{user?.name}</h1>
          <p className="profile-username">@{user?.username}</p>
        </div>
      </div>

      <h2>Connection Requests</h2>
      {loading ? (
        <p className="empty-state">Loading...</p>
      ) : requests.length === 0 ? (
        <p className="empty-state">No pending requests.</p>
      ) : (
        <div className="request-list">
          {requests.map((req) => (
            <div key={req._id} className="request-item">
              <Avatar name={req.requester.name} color={req.requester.avatarColor} size={40} />
              <div className="request-info">
                <p className="thread-name">{req.requester.name}</p>
                <p className="thread-meta">@{req.requester.username}</p>
              </div>
              <div className="request-actions">
                <button className="btn-primary" onClick={() => respond(req._id, "accept")}>
                  Accept
                </button>
                <button className="btn-secondary" onClick={() => respond(req._id, "reject")}>
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;