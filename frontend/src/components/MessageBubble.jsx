import Avatar from "./Avatar";

const MessageBubble = ({ message, isOwn }) => {
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`message-row ${isOwn ? "own" : ""}`}>
      {!isOwn && (
        <Avatar name={message.sender?.name} color={message.sender?.avatarColor} size={30} />
      )}
      <div className="message-bubble-wrap">
        {!isOwn && <p className="message-sender">{message.sender?.name}</p>}
        <div className={`message-bubble ${isOwn ? "own" : ""}`}>
          {message.attachment?.url && message.attachment.fileType === "image" && (
            <img
              src={message.attachment.url}
              alt={message.attachment.fileName}
              className="message-image"
            />
          )}
          {message.attachment?.url && message.attachment.fileType === "file" && (
            <a
              href={message.attachment.url}
              target="_blank"
              rel="noreferrer"
              className="message-file"
            >
              📎 {message.attachment.fileName}
            </a>
          )}
          {message.content && <p className="message-text">{message.content}</p>}
        </div>
        <p className="message-time">{time}</p>
      </div>
    </div>
  );
};

export default MessageBubble;
