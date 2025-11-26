// frontend/src/components/DonorForm.jsx
import { useState } from "react";

export default function DonorForm({ apiUrl, auth }) {
  const [form, setForm] = useState({
    donorName: auth.user?.name || "",
    phone: "",
    address: "",
    foodDetails: "",
    quantity: "",
    bestBeforeTime: "",
  });

  const [status, setStatus] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("Submitting...");

    try {
      const res = await fetch(`${apiUrl}/donations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("Error: " + (data.message || "Something went wrong"));
        return;
      }

      setStatus("Donation posted! NGOs can now see it.");

      setForm({
        donorName: auth.user?.name || "",
        phone: "",
        address: "",
        foodDetails: "",
        quantity: "",
        bestBeforeTime: "",
      });
    } catch (err) {
      setStatus("Network error, please try again.");
      console.error(err);
    }
  }

  return (
    <div className="fb-donor-card">
      <header className="fb-donor-header">
        <h2 className="fb-donor-title">Donate leftover food</h2>
        <p className="fb-donor-subtitle">
          Share a few details so nearby NGOs can quickly pick it up and serve it
          fresh.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="fb-donor-form">
        <div className="fb-form-group">
          <label className="fb-form-label-lg" htmlFor="donorName">
            Your name
          </label>
          <input
            id="donorName"
            name="donorName"
            className="fb-input-lg"
            value={form.donorName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="fb-form-group">
          <label className="fb-form-label-lg" htmlFor="phone">
            Phone number
          </label>
          <input
            id="phone"
            name="phone"
            className="fb-input-lg"
            value={form.phone}
            onChange={handleChange}
            placeholder="We’ll share this with the NGO for coordination"
            required
          />
        </div>

        <div className="fb-form-group">
          <label className="fb-form-label-lg" htmlFor="address">
            Pickup address
          </label>
          <textarea
            id="address"
            name="address"
            className="fb-input-lg fb-textarea"
            value={form.address}
            onChange={handleChange}
            placeholder="Flat / building, street, landmark, city"
            required
          />
        </div>

        <div className="fb-form-group">
          <label className="fb-form-label-lg" htmlFor="foodDetails">
            Food details
          </label>
          <textarea
            id="foodDetails"
            name="foodDetails"
            className="fb-input-lg fb-textarea"
            value={form.foodDetails}
            onChange={handleChange}
            placeholder="e.g. 10 plates of veg biryani, 5 rotis, 2 bowls of dal"
            required
          />
        </div>

        <div className="fb-donor-grid">
          <div className="fb-form-group">
            <label className="fb-form-label-lg" htmlFor="quantity">
              Quantity (optional)
            </label>
            <input
              id="quantity"
              name="quantity"
              className="fb-input-lg"
              value={form.quantity}
              onChange={handleChange}
              placeholder="Approx. servings (e.g. 10)"
            />
          </div>

          <div className="fb-form-group">
            <label className="fb-form-label-lg" htmlFor="bestBeforeTime">
              Best before time
            </label>
            <input
              id="bestBeforeTime"
              name="bestBeforeTime"
              className="fb-input-lg"
              value={form.bestBeforeTime}
              onChange={handleChange}
              placeholder="e.g. today, 9:30 PM"
            />
          </div>
        </div>

        <button
          type="submit"
          className="fb-btn fb-btn-primary fb-donor-submit"
        >
          Post donation
        </button>
      </form>

      {status && (
        <p
          className={
            status.startsWith("Donation posted")
              ? "fb-donor-status fb-donor-status-success"
              : "fb-donor-status fb-donor-status-error"
          }
        >
          {status}
        </p>
      )}
    </div>
  );
}
