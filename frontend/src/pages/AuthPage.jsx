import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AuthPage = () => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "username") {
      setForm({ ...form, username: value.toLowerCase().replace(/[^a-z0-9_]/g, "") });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const switchMode = (next) => {
    setMode(next);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (mode === "signup" && form.username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.username, form.email, form.password);
      }
      navigate("/chat");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <Link to="/" className="auth-back-brand">
        <span className="brand-dot" /> Pulse
      </Link>

      <div className="auth-card">
        <div className="mode-toggle">
          <button
            className={mode === "login" ? "toggle-btn active" : "toggle-btn"}
            onClick={() => switchMode("login")}
            type="button"
          >
            Log In
          </button>
          <button
            className={mode === "signup" ? "toggle-btn active" : "toggle-btn"}
            onClick={() => switchMode("signup")}
            type="button"
          >
            Sign Up
          </button>
        </div>

        <h1>{mode === "login" ? "Welcome back" : "Join Pulse"}</h1>
        <p className="auth-subtitle">
          {mode === "login" ? "Log in to keep the conversation going" : "Create an account to start chatting"}
        </p>

        {error && <p className="form-error">{error}</p>}

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <>
              <div className="form-field">
                <label>Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label>Username</label>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="e.g. aditya_dixit"
                  minLength={3}
                  required
                />
                <p className="field-hint">
                  {form.username
                    ? `Others can find you as @${form.username}`
                    : "Lowercase letters, numbers, and underscores only"}
                </p>
              </div>
            </>
          )}
          <div className="form-field">
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-field">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              minLength={6}
              required
            />
          </div>

          <button type="submit" className="btn-primary btn-full" disabled={submitting}>
            {submitting ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}
          </button>
        </form>

        <p className="switch-text">
          {mode === "login" ? "New to Pulse? " : "Already have an account? "}
          <span className="switch-link" onClick={() => switchMode(mode === "login" ? "signup" : "login")}>
            {mode === "login" ? "Sign up" : "Log in"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
