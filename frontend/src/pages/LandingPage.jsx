import { Link } from "react-router-dom";

const FEATURES = [
  {
    icon: "⚡",
    title: "Real-Time, Always",
    text: "Messages land instantly over WebSockets — no refreshing, no delay.",
  },
  {
    icon: "🏷️",
    title: "Rooms & Direct Messages",
    text: "Join group rooms for team chatter, or message someone one-on-one.",
  },
  {
    icon: "🟢",
    title: "Live Presence",
    text: "See who's online, who's typing, and when someone was last active.",
  },
  {
    icon: "📎",
    title: "Share Anything",
    text: "Drop in images and files right inside the conversation.",
  },
];

const LandingPage = () => {
  return (
    <div className="landing-page">
      <header className="landing-nav">
        <div className="landing-brand">
          <span className="brand-dot" /> Pulse
        </div>
        <Link to="/login" className="btn-outline">
          Log In
        </Link>
      </header>

      <section className="landing-hero">
        <div className="hero-copy">
          <p className="hero-eyebrow">Real-Time Chat</p>
          <h1>
            Conversations that move <span className="hero-highlight">at the speed of now</span>
          </h1>
          <p className="hero-subtitle">
            Pulse is a real-time messaging app built for teams and friends — group rooms, private
            chats, live presence, and instant delivery, all in one place.
          </p>
          <div className="hero-actions">
            <Link to="/login" className="btn-primary btn-large">
              Get Started
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="floating-bubble bubble-1">Hey! Are you free later? 👋</div>
          <div className="floating-bubble bubble-2 own">Yep, just finishing up something</div>
          <div className="floating-bubble bubble-3">Perfect, let's sync in the design room 🎨</div>
          <div className="pulse-ring ring-1" />
          <div className="pulse-ring ring-2" />
          <div className="pulse-ring ring-3" />
        </div>
      </section>

      <section className="landing-features">
        <h2>Everything a conversation needs</h2>
        <div className="feature-grid">
          {FEATURES.map((f, i) => (
            <div className="feature-card" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
              <span className="feature-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-cta">
        <h2>Ready to jump in?</h2>
        <p>Create an account and start chatting in seconds.</p>
        <Link to="/login" className="btn-primary btn-large">
          Get Started — It's Free
        </Link>
      </section>

      <footer className="landing-footer">
        <p>Built for the Full-Stack Web Development Internship at Prodigy InfoTech.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
