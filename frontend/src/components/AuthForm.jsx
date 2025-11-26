// frontend/src/components/AuthForm.jsx
import { useState } from "react";

export default function AuthForm({ apiUrl, role, onAuth }) {
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [status, setStatus] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("Processing...");

    const endpoint = mode === "login" ? "/auth/login" : "/auth/register";

    try {
      const res = await fetch(`${apiUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(data.message || "Error");
        return;
      }

      onAuth({ user: data.user, token: data.token });
      setStatus("Success! Logged in.");
    } catch (err) {
      console.error(err);
      setStatus("Network error");
    }
  }

  const roleLabel = role === "donor" ? "Donor" : "NGO";

  return (
    <div className="fb-auth-card">
      <div className="fb-auth-header">
        <h2 className="fb-auth-title">{roleLabel} access</h2>
        <p className="fb-auth-subtitle">
          Log in to your {roleLabel.toLowerCase()} account or create a new one.
        </p>

        <div className="fb-auth-mode-toggle">
          <button
            type="button"
            className={
              mode === "login"
                ? "fb-auth-mode-btn fb-auth-mode-btn-active"
                : "fb-auth-mode-btn"
            }
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={
              mode === "register"
                ? "fb-auth-mode-btn fb-auth-mode-btn-active"
                : "fb-auth-mode-btn"
            }
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="fb-auth-form">
        {mode === "register" && (
          <div className="fb-form-group">
            <label className="fb-form-label" htmlFor={`name-${role}`}>
              Full name
            </label>
            <input
              id={`name-${role}`}
              name="name"
              className="fb-input"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Rahul Verma"
              required
            />
          </div>
        )}

        <div className="fb-form-group">
          <label className="fb-form-label" htmlFor={`email-${role}`}>
            Email
          </label>
          <input
            id={`email-${role}`}
            type="email"
            name="email"
            className="fb-input"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="fb-form-group">
          <label className="fb-form-label" htmlFor={`password-${role}`}>
            Password
          </label>
          <input
            id={`password-${role}`}
            type="password"
            name="password"
            className="fb-input"
            value={form.password}
            onChange={handleChange}
            placeholder="Minimum 6 characters"
            required
          />
        </div>

        <button type="submit" className="fb-btn fb-btn-primary fb-auth-submit">
          {mode === "login" ? "Login" : "Create account"}
        </button>
      </form>

      {status && (
        <p
          className={
            status.startsWith("Success")
              ? "fb-auth-status fb-auth-status-success"
              : "fb-auth-status fb-auth-status-error"
          }
        >
          {status}
        </p>
      )}
    </div>
  );
}
