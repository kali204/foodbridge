// frontend/src/App.jsx
import { useState } from "react";
import DonorForm from "./components/DonorForm.jsx";
import DonationList from "./components/DonationList.jsx";
import AuthForm from "./components/AuthForm.jsx";
import "./App.css";

const API_URL = "http://localhost:5000/api";

export default function App() {
  const [tab, setTab] = useState("donor"); // 'donor' | 'ngo'
  const [auth, setAuth] = useState({ user: null, token: null });

  function handleLogout() {
    setAuth({ user: null, token: null });
  }

  const currentRole = auth.user?.role;

  return (
    <div className="fb-app">
      {/* Top gradient background */}
      <div className="fb-app-bg" />

      <header className="fb-header">
        <div className="fb-header-main">
          <div className="fb-logo-wrap">
            <div className="fb-logo-dot" />
            <h1 className="fb-logo-text">FoodBridge</h1>
          </div>
          <p className="fb-subtitle">
            Connect surplus food from donors to NGOs in minutes.
          </p>

          {auth.user ? (
            <div className="fb-user-info">
              <span>
                Logged in as <strong>{auth.user.name}</strong> (
                {auth.user.role.toUpperCase()})
              </span>
              <button onClick={handleLogout} className="fb-btn fb-btn-ghost">
                Logout
              </button>
            </div>
          ) : (
            <p className="fb-hint">
              Please login or register to continue as Donor or NGO.
            </p>
          )}
        </div>

        {/* Role tabs */}
        <div className="fb-tabs">
          <button
            className={
              tab === "donor" ? "fb-tab fb-tab-active" : "fb-tab"
            }
            onClick={() => setTab("donor")}
          >
            Donor
          </button>
          <button
            className={tab === "ngo" ? "fb-tab fb-tab-active" : "fb-tab"}
            onClick={() => setTab("ngo")}
          >
            NGO
          </button>
        </div>
      </header>

      <main className="fb-main">
        <section className="fb-panel">
          {tab === "donor" ? (
            currentRole === "donor" && auth.token ? (
              <>
                <h2 className="fb-panel-title">Share leftover food</h2>
                <p className="fb-panel-desc">
                  Add details about your surplus food so nearby NGOs can pick it up
                  before it goes to waste.
                </p>
                <DonorForm apiUrl={API_URL} auth={auth} />
              </>
            ) : (
              <>
                <h2 className="fb-panel-title">Donor login / register</h2>
                <p className="fb-panel-desc">
                  Create a donor account or log in to post your available food.
                </p>
                <AuthForm apiUrl={API_URL} role="donor" onAuth={setAuth} />
              </>
            )
          ) : currentRole === "ngo" && auth.token ? (
            <>
              <h2 className="fb-panel-title">Browse nearby donations</h2>
              <p className="fb-panel-desc">
                View live food posts, claim them, and update pickup status.
              </p>
              <DonationList apiUrl={API_URL} auth={auth} />
            </>
          ) : (
            <>
              <h2 className="fb-panel-title">NGO login / register</h2>
              <p className="fb-panel-desc">
                Login with your approved NGO account and start claiming food.
              </p>
              <AuthForm apiUrl={API_URL} role="ngo" onAuth={setAuth} />
            </>
          )}
        </section>

        {/* Side info / how it works */}
        <aside className="fb-sidecard">
          <h3>How FoodBridge works</h3>
          <ol className="fb-steps">
            <li>Donors post leftover food with time and location.</li>
            <li>Nearby verified NGOs claim the food and head for pickup.</li>
            <li>Pickups are tracked and meals are served to the needy.</li>
          </ol>
          <div className="fb-stats">
            <div className="fb-stat-item">
              <span className="fb-stat-label">Today&apos;s meals saved</span>
              <span className="fb-stat-value">1,240</span>
            </div>
            <div className="fb-stat-item">
              <span className="fb-stat-label">Active NGOs</span>
              <span className="fb-stat-value">36</span>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
