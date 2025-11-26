// frontend/src/components/DonationList.jsx
import { useEffect, useState } from "react";

export default function DonationList({ apiUrl, auth }) {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  async function loadDonations() {
    setLoading(true);
    setStatusMsg("");

    try {
      const res = await fetch(`${apiUrl}/donations?status=open`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      const data = await res.json();

      if (!res.ok) {
        setStatusMsg(data.message || "Error loading donations");
        setDonations([]);
        return;
      }

      setDonations(data);
      if (data.length === 0) {
        setStatusMsg("No open donations right now.");
      }
    } catch (err) {
      console.error(err);
      setStatusMsg("Error loading donations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDonations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handlePick(id) {
    try {
      const res = await fetch(`${apiUrl}/donations/${id}/pick`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Error updating donation");
        return;
      }

      setDonations((prev) => prev.filter((d) => d.id !== id));
      setStatusMsg("Marked as picked. Thank you!");
    } catch (err) {
      console.error(err);
      alert("Network error");
    }
  }

  return (
    <div className="fb-ngo-card">
      <header className="fb-ngo-header">
        <div>
          <h2 className="fb-ngo-title">NGO dashboard</h2>
          <p className="fb-ngo-subtitle">
            View live donations from donors nearby and mark them as picked once
            collected.
          </p>
        </div>

        <div className="fb-ngo-user">
          <span className="fb-ngo-user-name">
            {auth.user?.name || "NGO user"}
          </span>
          <button
            type="button"
            className="fb-btn fb-btn-ghost fb-ngo-refresh"
            onClick={loadDonations}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh list"}
          </button>
        </div>
      </header>

      {statusMsg && (
        <p className="fb-ngo-status">
          {statusMsg}
        </p>
      )}

      <div className="fb-ngo-list">
        {loading && donations.length === 0 && (
          <div className="fb-ngo-empty">
            <span className="fb-ngo-spinner" />
            <p>Loading donations...</p>
          </div>
        )}

        {!loading && donations.length === 0 && !statusMsg && (
          <div className="fb-ngo-empty">
            <p>No open donations right now.</p>
          </div>
        )}

        {donations.map((d) => (
          <article key={d.id} className="fb-ngo-donation">
            <div className="fb-ngo-donation-main">
              <div className="fb-ngo-chip-row">
                <span className="fb-ngo-chip">Open</span>
                {d.bestBeforeTime && (
                  <span className="fb-ngo-chip fb-ngo-chip-soft">
                    Best before: {d.bestBeforeTime}
                  </span>
                )}
              </div>
              <h3 className="fb-ngo-donation-title">{d.foodDetails}</h3>

              <dl className="fb-ngo-meta">
                <div>
                  <dt>Donor</dt>
                  <dd>{d.donorName}</dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd>{d.phone}</dd>
                </div>
                <div className="fb-ngo-address">
                  <dt>Address</dt>
                  <dd>{d.address}</dd>
                </div>
                {d.quantity && (
                  <div>
                    <dt>Quantity</dt>
                    <dd>{d.quantity}</dd>
                  </div>
                )}
              </dl>
            </div>

            <footer className="fb-ngo-actions">
              <button
                type="button"
                className="fb-btn fb-btn-primary fb-ngo-pick-btn"
                onClick={() => handlePick(d.id)}
              >
                Mark as picked
              </button>
            </footer>
          </article>
        ))}
      </div>
    </div>
  );
}
