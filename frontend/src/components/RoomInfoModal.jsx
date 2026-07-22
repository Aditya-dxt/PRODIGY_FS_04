import { useState, useEffect } from "react";
import api from "../api/axios";
import Avatar from "./Avatar";

const RoomInfoModal = ({ roomId, onClose, onRequestSent, onRoomChange }) => {
  const [room, setRoom] = useState(null);
  const [error, setError] = useState("");

  const load = () => {
    api
      .get(`/rooms/${roomId}`)
      .then((res) => setRoom(res.data.room))
      .catch((err) => setError(err.response?.data?.message || "Failed to load room"));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const respond = async (userId, action) => {
    await api.patch(`/rooms/${roomId}/requests/${userId}`, { action });
    load();
    onRoomChange?.();
  };

  const requestJoin = async () => {
    setError("");
    try {
      await api.post(`/rooms/${roomId}/request`);
      onRequestSent?.();
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send request");
    }
  };

  if (!room) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          {error ? <p className="form-error">{error}</p> : <p className="empty-state small">Loading...</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3># {room.name}</h3>
        <p className="thread-meta">{room.description || "No description provided."}</p>
        <p className="thread-meta">{room.memberCount} member(s)</p>

        {error && <p className="form-error">{error}</p>}

        {room.isMember && room.code && (
          <p className="room-code-display">
            Room Code: <strong>{room.code}</strong> — share this so others can find and request to
            join.
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

        {room.isAdmin && (
          <>
            <h4 style={{ marginTop: 20, marginBottom: 8 }}>
              Join Requests {room.joinRequests.length > 0 && `(${room.joinRequests.length})`}
            </h4>
            {room.joinRequests.length === 0 ? (
              <p className="empty-state small">No pending requests.</p>
            ) : (
              room.joinRequests.map((r) => (
                <div key={r.user._id} className="request-item">
                  <Avatar name={r.user.name} color={r.user.avatarColor} size={32} />
                  <div className="request-info">
                    <p className="thread-name">{r.user.name}</p>
                    <p className="thread-meta">@{r.user.username}</p>
                  </div>
                  <div className="request-actions">
                    <button className="btn-primary" onClick={() => respond(r.user._id, "accept")}>
                      Accept
                    </button>
                    <button className="btn-secondary" onClick={() => respond(r.user._id, "reject")}>
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomInfoModal;
