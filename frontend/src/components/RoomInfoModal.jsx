import { useState, useEffect } from "react";
import api from "../api/axios";
import Avatar from "./Avatar";

const RoomInfoModal = ({ roomId, onClose, onRequestSent }) => {
  const [room, setRoom] = useState(null);

  const load = () => api.get(`/rooms/${roomId}`).then((res) => setRoom(res.data.room));

  useEffect(() => { load(); }, [roomId]);

  const respond = async (userId, action) => {
    await api.patch(`/rooms/${roomId}/requests/${userId}`, { action });
    load();
  };

  const requestJoin = async () => {
    await api.post(`/rooms/${roomId}/request`);
    onRequestSent?.();
    load();
  };

  if (!room) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{room.name}</h3>
        <p className="thread-meta">{room.description || "No description"}</p>
        <p className="thread-meta">{room.memberCount} member(s)</p>

        {room.isMember && (
          <p className="room-code-display">
            Room Code: <strong>{room.code}</strong>
          </p>
        )}

        {!room.isMember && !room.hasRequested && (
          <button className="btn-primary btn-full" onClick={requestJoin}>
            Request to Join
          </button>
        )}
        {!room.isMember && room.hasRequested && (
          <p className="empty-state small">Join request pending approval.</p>
        )}

        {room.isAdmin && room.joinRequests.length > 0 && (
          <>
            <h4 style={{ marginTop: 20 }}>Join Requests</h4>
            {room.joinRequests.map((r) => (
              <div key={r.user._id} className="request-item">
                <Avatar name={r.user.name} color={r.user.avatarColor} size={32} />
                <div className="request-info">
                  <p className="thread-name">{r.user.name}</p>
                  <p className="thread-meta">@{r.user.username}</p>
                </div>
                <div className="request-actions">
                  <button className="btn-primary" onClick={() => respond(r.user._id, "accept")}>Accept</button>
                  <button className="btn-secondary" onClick={() => respond(r.user._id, "reject")}>Reject</button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default RoomInfoModal;