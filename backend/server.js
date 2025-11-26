// backend/server.js
const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 5000;

// In a real app, use env variable
const JWT_SECRET = "CHANGE_THIS_SECRET_IN_PRODUCTION";

// Middlewares
app.use(cors());
app.use(express.json());

// In-memory "database"
let users = []; // { id, name, email, passwordHash, role }
let donations = []; // same as before

// Helpers
function generateToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { id, role, name }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: "Forbidden: wrong role" });
    }
    next();
  };
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

///////////////////////////////////////
//   AUTH ROUTES
///////////////////////////////////////

// Register (Donor or NGO)
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!["donor", "ngo"].includes(role)) {
      return res.status(400).json({ message: "Role must be donor or ngo" });
    }

    const existing = users.find((u) => u.email === email);
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
      id: uuidv4(),
      name,
      email,
      passwordHash,
      role,
    };

    users.push(user);

    const token = generateToken(user);
    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = users.find((u) => u.email === email && u.role === role);
    if (!user) {
      return res.status(400).json({ message: "Invalid email or role" });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

///////////////////////////////////////
//   DONATION ROUTES (PROTECTED)
///////////////////////////////////////

// Create a donation (Donor only)
app.post(
  "/api/donations",
  authMiddleware,
  requireRole("donor"),
  (req, res) => {
    const {
      donorName,
      phone,
      address,
      foodDetails,
      quantity,
      bestBeforeTime,
    } = req.body;

    if (!phone || !address || !foodDetails) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const donation = {
      id: uuidv4(),
      donorId: req.user.id,
      donorName: donorName || req.user.name,
      phone,
      address,
      foodDetails,
      quantity: quantity || "",
      bestBeforeTime: bestBeforeTime || "",
      status: "open", // 'open' | 'picked'
      ngoName: null,
      ngoId: null,
      createdAt: new Date().toISOString(),
    };

    donations.push(donation);
    res.status(201).json(donation);
  }
);

// Get open donations (NGO only)
app.get(
  "/api/donations",
  authMiddleware,
  requireRole("ngo"),
  (req, res) => {
    const { status } = req.query;
    let result = donations;

    if (status) {
      result = donations.filter((d) => d.status === status);
    }

    res.json(result);
  }
);

// Mark donation as picked (NGO only)
app.patch(
  "/api/donations/:id/pick",
  authMiddleware,
  requireRole("ngo"),
  (req, res) => {
    const { id } = req.params;

    const donation = donations.find((d) => d.id === id);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    if (donation.status === "picked") {
      return res.status(400).json({ message: "Already picked" });
    }

    donation.status = "picked";
    donation.ngoName = req.user.name;
    donation.ngoId = req.user.id;

    res.json(donation);
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
