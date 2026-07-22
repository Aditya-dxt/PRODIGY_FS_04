const Avatar = ({ name, color = "#5b3df5", isOnline, size = 40 }) => {
  const initial = name?.charAt(0).toUpperCase() || "?";

  return (
    <div className="avatar-wrap" style={{ width: size, height: size }}>
      <div
        className="avatar-circle"
        style={{ background: color, width: size, height: size, fontSize: size * 0.4 }}
      >
        {initial}
      </div>
      {isOnline !== undefined && (
        <span className={`presence-dot ${isOnline ? "online" : "offline"}`} />
      )}
    </div>
  );
};

export default Avatar;
