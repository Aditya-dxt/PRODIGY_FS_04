import { useState } from "react";
import api from "../api/axios";

const JoinRoomModal = ({ onClose, onFound }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setSearching(true);
    try {
      const res = await api.get("/rooms/search", { params: { code: code.trim() } });
      onFound(res.data.room);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Room not found");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Join a Room</h3>
        {error && <p className="form-error">{error}</p>}
        <form onSubmit={handleSearch}>
          <div className="form-field">
            <label>Room Code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. A1B2C3"
              autoFocus
            />
          </div>
          <button className="btn-primary btn-full" disabled={searching}>
            {searching ? "Searching..." : "Find Room"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinRoomModal;