import { useEffect, useRef } from "react";
import Avatar from "./Avatar";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";

const ChatWindow = ({
  thread,
  messages,
  currentUserId,
  onSend,
  onTypingStart,
  onTypingStop,
  typingNames,
  presenceMap,
}) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingNames]);

  if (!thread) {
    return (
      <div className="chat-window empty">
        <div className="empty-chat-state">
          <span className="empty-chat-icon">💬</span>
          <h3>Select a conversation</h3>
          <p>Choose a room or a direct message to start chatting.</p>
        </div>
      </div>
    );
  }

  const otherOnline = thread.type === "dm"
    ? (presenceMap[thread.otherUser?._id]?.isOnline ?? !!thread.otherUser?.isOnline)
    : null;

  return (
    <div className="chat-window">
      <div className="chat-window-header">
        {thread.type === "room" ? (
          <div className="thread-avatar room-avatar">#</div>
        ) : (
          <Avatar
            name={thread.otherUser?.name}
            color={thread.otherUser?.avatarColor}
            isOnline={otherOnline}
            size={36}
          />
        )}
        <div>
          <h3>{thread.name}</h3>
          {thread.type === "dm" && (
            <p className="chat-header-status">{otherOnline ? "Online" : "Offline"}</p>
          )}
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <p className="empty-state small">No messages yet. Say hello!</p>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              message={msg}
              isOwn={msg.sender?._id === currentUserId || msg.sender === currentUserId}
            />
          ))
        )}
        <TypingIndicator names={typingNames} />
        <div ref={scrollRef} />
      </div>

      <MessageInput onSend={onSend} onTypingStart={onTypingStart} onTypingStop={onTypingStop} />
    </div>
  );
};

export default ChatWindow;
