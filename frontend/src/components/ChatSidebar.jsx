import { Link } from "react-router-dom";
import Avatar from "./Avatar";

const ChatSidebar = ({
  activeTab,
  setActiveTab,
  rooms,
  conversations,
  selectedThread,
  onSelectThread,
  presenceMap,
  unreadCounts,
  onOpenCreateRoom,
  onOpenJoinRoom,
  onOpenRoomInfo,
  onOpenNewDM,
  currentUser,
  onLogout,
}) => {
  const isOnline = (userId, fallback) => {
    const live = presenceMap[userId];
    return live ? live.isOnline : !!fallback;
  };

  const roomMeta = (room) => {
    if (room.isMember) return `${room.memberCount} member(s)`;
    if (room.hasRequested) return `${room.memberCount} member(s) · request pending`;
    return `${room.memberCount} member(s) · not joined`;
  };

  return (
    <aside className="chat-sidebar">
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <span className="brand-dot" /> Pulse
        </div>
        <div className="sidebar-user">
          <Link to="/profile" title="View profile">
            <Avatar name={currentUser?.name} color={currentUser?.avatarColor} size={32} />
          </Link>
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{currentUser?.name}</p>
            <Link to="/profile" className="sidebar-user-link">
              @{currentUser?.username}
            </Link>
          </div>
          <button className="icon-btn" onClick={onLogout} title="Log out">
            ⏻
          </button>
        </div>
      </div>

      <div className="sidebar-tabs">
        <button
          className={activeTab === "rooms" ? "sidebar-tab active" : "sidebar-tab"}
          onClick={() => setActiveTab("rooms")}
        >
          Rooms
        </button>
        <button
          className={activeTab === "dms" ? "sidebar-tab active" : "sidebar-tab"}
          onClick={() => setActiveTab("dms")}
        >
          Direct Messages
        </button>
      </div>

      <div className="sidebar-action">
        {activeTab === "rooms" ? (
          <div className="sidebar-action-row">
            <button className="btn-outline" onClick={onOpenCreateRoom}>
              + New Room
            </button>
            <button className="btn-outline" onClick={onOpenJoinRoom}>
              Join by Code
            </button>
          </div>
        ) : (
          <button className="btn-outline btn-full" onClick={onOpenNewDM}>
            + New Message
          </button>
        )}
      </div>

      <div className="sidebar-list">
        {activeTab === "rooms" &&
          rooms.map((room) => {
            const key = `room:${room._id}`;
            const isActive = selectedThread?.type === "room" && selectedThread.id === room._id;
            return (
              <button
                key={room._id}
                className={isActive ? "thread-item active" : "thread-item"}
                onClick={() =>
                  onSelectThread({
                    type: "room",
                    id: room._id,
                    name: room.name,
                    isMember: room.isMember,
                  })
                }
              >
                <div className="thread-avatar room-avatar">#</div>
                <div className="thread-info">
                  <p className="thread-name">{room.name}</p>
                  <p className="thread-meta">{roomMeta(room)}</p>
                </div>
                {room.isAdmin && room.pendingRequestCount > 0 && (
                  <span className="unread-badge admin-badge">{room.pendingRequestCount}</span>
                )}
                {unreadCounts[key] > 0 && <span className="unread-badge">{unreadCounts[key]}</span>}
                <span
                  className="room-info-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenRoomInfo(room._id);
                  }}
                  title="Room info"
                >
                  ⓘ
                </span>
              </button>
            );
          })}

        {activeTab === "rooms" && rooms.length === 0 && (
          <p className="empty-state small">No rooms yet — create the first one.</p>
        )}

        {activeTab === "dms" &&
          conversations.map((conv) => {
            const key = `dm:${conv._id}`;
            const isActive = selectedThread?.type === "dm" && selectedThread.id === conv._id;
            return (
              <button
                key={conv._id}
                className={isActive ? "thread-item active" : "thread-item"}
                onClick={() =>
                  onSelectThread({
                    type: "dm",
                    id: conv._id,
                    name: conv.otherUser?.name,
                    otherUser: conv.otherUser,
                  })
                }
              >
                <Avatar
                  name={conv.otherUser?.name}
                  color={conv.otherUser?.avatarColor}
                  isOnline={isOnline(conv.otherUser?._id, conv.otherUser?.isOnline)}
                  size={38}
                />
                <div className="thread-info">
                  <p className="thread-name">{conv.otherUser?.name}</p>
                  <p className="thread-meta">
                    {conv.lastMessage?.content
                      ? conv.lastMessage.content.slice(0, 30)
                      : conv.lastMessage?.attachment?.url
                      ? "📎 Attachment"
                      : conv.isConnected === false
                      ? "Awaiting connection..."
                      : "No messages yet"}
                  </p>
                </div>
                {unreadCounts[key] > 0 && <span className="unread-badge">{unreadCounts[key]}</span>}
              </button>
            );
          })}

        {activeTab === "dms" && conversations.length === 0 && (
          <p className="empty-state small">No conversations yet — start one.</p>
        )}
      </div>
    </aside>
  );
};

export default ChatSidebar;