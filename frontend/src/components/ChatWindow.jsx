import { useEffect, useRef } from "react";
import Avatar from "./Avatar";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";

const ChatWindow = ({
  thread,
  messages,
  isReadOnly,
  currentUserId,
  onSend,
  onTypingStart,
  onTypingStop,
  typingNames,
  presenceMap,
  onOpenRoomInfo,
  onViewProfile,
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

  const otherOnline =
    thread.type === "dm"
      ? (presenceMap[thread.otherUser?._id]?.isOnline ??
        !!thread.otherUser?.isOnline)
      : null;

  return (
    <div className="chat-window">
      <div className="chat-window-header">
        {thread.type === "room" ? (
          <div className="thread-avatar room-avatar">#</div>
        ) : (
          <button
            className="header-avatar-btn"
            onClick={() => onViewProfile(thread.otherUser?._id)}
            title="View profile"
          >
            <Avatar
              name={thread.otherUser?.name}
              color={thread.otherUser?.avatarColor}
              isOnline={otherOnline}
              size={36}
            />
          </button>
        )}

        <div>
          {thread.type === "room" ? (
            <button
              className="chat-header-title-btn"
              onClick={() => onOpenRoomInfo(thread.id)}
            >
              <h3>{thread.name}</h3>
              <span className="chat-header-info-hint">View room info</span>
            </button>
          ) : (
            <h3>{thread.name}</h3>
          )}
          {thread.type === "dm" && (
            <p className="chat-header-status">
              {otherOnline ? "Online" : "Offline"}
            </p>
          )}
        </div>
      </div>

      {isReadOnly && (
        <div className="preview-banner">
          Previewing the last 24 hours. You'll need to join this room to send
          messages.
        </div>
      )}

      <div className="chat-messages">
        {messages.length === 0 ? (
          <p className="empty-state small">
            {isReadOnly
              ? "No recent activity in this room."
              : "No messages yet. Say hello!"}
          </p>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              message={msg}
              isOwn={
                msg.sender?._id === currentUserId ||
                msg.sender === currentUserId
              }
            />
          ))
        )}
        <TypingIndicator names={typingNames} />
        <div ref={scrollRef} />
      </div>

      {isReadOnly ? (
        <div className="readonly-banner">
          🔒 You're not a member of this room yet — open room info to request to
          join.
        </div>
      ) : (
        <MessageInput
          onSend={onSend}
          onTypingStart={onTypingStart}
          onTypingStop={onTypingStop}
        />
      )}
    </div>
  );
};

export default ChatWindow;
