import { useState, useRef } from "react";
import api from "../api/axios";

const MessageInput = ({ onSend, onTypingStart, onTypingStop }) => {
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const handleChange = (e) => {
    setText(e.target.value);
    onTypingStart?.();
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => onTypingStop?.(), 1500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend({ content: text.trim() });
    setText("");
    onTypingStop?.();
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onSend({ content: "", attachment: res.data.attachment });
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <form className="message-input-bar" onSubmit={handleSubmit}>
      <button
        type="button"
        className="icon-btn"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        title="Attach a file"
      >
        {uploading ? "…" : "📎"}
      </button>
      <input type="file" ref={fileInputRef} hidden onChange={handleFileSelect} />

      <input
        type="text"
        placeholder="Type a message..."
        value={text}
        onChange={handleChange}
        className="message-text-input"
      />

      <button type="submit" className="send-btn" disabled={!text.trim()}>
        Send
      </button>
    </form>
  );
};

export default MessageInput;
