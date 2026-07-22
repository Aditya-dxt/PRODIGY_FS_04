// Uploaded file URLs come back from the API as relative paths (e.g. "/uploads/xyz.jpg"),
// which the browser would otherwise resolve against the frontend's own origin
// (localhost:5173) instead of the backend that actually serves the file
// (localhost:5000). This prefixes them with the real backend origin.
const API_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
  : "http://localhost:5000";

export const resolveFileUrl = (url) => {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE}${url}`;
};
