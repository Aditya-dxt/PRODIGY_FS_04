import { useState, useEffect } from "react";
import api from "../api/axios";
import Avatar from "./Avatar";

const NewDMModal = ({ onClose, onStart, onViewProfile }) => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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
                <button
                  className="user-search-avatar-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewProfile(u._id);
                  }}
                  title="View profile"
                >
                  <Avatar name={u.name} color={u.avatarColor} isOnline={u.isOnline} size={36} />
                </button>
                <button className="user-search-item-main" onClick={() => onStart(u._id)}>
                  <div>
                    <p className="thread-name">{u.name}</p>
                    <p className="thread-meta">@{u.username}</p>
                  </div>
                </button>
              </div>
            ))
          )}
        </div>

        <p className="modal-footnote">
          Tap the avatar to view their profile and send a connection request, or tap the name to
          start messaging directly.
        </p>
      </div>
    </div>
  );
};

export default NewDMModal;