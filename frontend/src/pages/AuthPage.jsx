import AuthForm from "../components/AuthForm";
import "../style/AuthForm.css";

export default function AuthPage({ apiUrl, role, onAuth }) {
  return (
    <div className="auth-page">
      {/* LEFT BLUE PANEL */}
      <div className="auth-left">
        <div className="hero-inner">
          <div className="hero-mark">*</div>
          <h1 className="hero-title">
            Hello
            <br />
            FoodBridge! 👋
          </h1>
          <p className="hero-text">
            Donate leftover food with ease. NGOs can pick it up quickly,
            reducing waste and feeding more people.
          </p>
          <p className="hero-footer">© 2025 FoodBridge. All rights reserved.</p>
        </div>
      </div>

      {/* RIGHT WHITE PANEL */}
      <div className="auth-right">
        <div className="brand-title">FoodBridge</div>
        <AuthForm apiUrl={apiUrl} role={role} onAuth={onAuth} />
      </div>
    </div>
  );
}
