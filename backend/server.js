// backend/server.js
const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const path = require("path"); // <-- added

const app = express();
const PORT = process.env.PORT || 5000;

// Use env var in production
const JWT_SECRET = process.env.JWT_SECRET || "CHANGE_THIS_SECRET_IN_PRODUCTION";

// Middlewares
app.use(cors());
app.use(express.json());

///////////////////////////////
//  MONGO CONNECTION
///////////////////////////////
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

///////////////////////////////
//  MONGO SCHEMAS / MODELS
///////////////////////////////

// Only donations in DB for now
const donationSchema = new mongoose.Schema(
  {
    donorId: String,
    donorName: String,
    phone: String,
    address: String,
    foodDetails: String,
    quantity: String,
    bestBeforeTime: String,
    status: { type: String, default: "open" }, // 'open' | 'picked'
    ngoName: { type: String, default: null },
    ngoId: { type: String, default: null },
  },
  { timestamps: true }
);

const Donation = mongoose.model("Donation", donationSchema);

///////////////////////////////
//  IN-MEMORY USERS
///////////////////////////////
let users = []; // { id, name, email, passwordHash, role }

///////////////////////////////
//  HELPERS
///////////////////////////////
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

///////////////////////////////
//  HEALTH CHECK
///////////////////////////////
app.get("/api/health", (req, res) => {
  const dbState = mongoose.connection.readyState; // 0 = disconnected, 1 = connected
  res.json({
    status: "ok",
    serverTime: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    dbConnected: dbState === 1,
  });
});

///////////////////////////////
//  AUTH ROUTES
///////////////////////////////

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
    console.error("Register error:", err);
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
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

///////////////////////////////
//  DONATION ROUTES (MongoDB)
///////////////////////////////

// Create a donation (Donor only)
app.post(
  "/api/donations",
  authMiddleware,
  requireRole("donor"),
  async (req, res) => {
    try {
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

      const donation = await Donation.create({
        donorId: req.user.id,
        donorName: donorName || req.user.name,
        phone,
        address,
        foodDetails,
        quantity: quantity || "",
        bestBeforeTime: bestBeforeTime || "",
        status: "open",
        ngoName: null,
        ngoId: null,
      });

      res.status(201).json(donation);
    } catch (err) {
      console.error("Create donation error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get donations (NGO only, optional status filter)
app.get(
  "/api/donations",
  authMiddleware,
  requireRole("ngo"),
  async (req, res) => {
    try {
      const { status } = req.query;
      const query = {};

      if (status) {
        query.status = status;
      }

      const donations = await Donation.find(query).sort({ createdAt: -1 });
      res.json(donations);
    } catch (err) {
      console.error("Get donations error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Mark donation as picked (NGO only)
app.patch(
  "/api/donations/:id/pick",
  authMiddleware,
  requireRole("ngo"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const donation = await Donation.findById(id);
      if (!donation) {
        return res.status(404).json({ message: "Donation not found" });
      }

      if (donation.status === "picked") {
        return res.status(400).json({ message: "Already picked" });
      }

      donation.status = "picked";
      donation.ngoName = req.user.name;
      donation.ngoId = req.user.id;

      await donation.save();

      res.json(donation);
    } catch (err) {
      console.error("Pick donation error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

///////////////////////////////
//  SERVE FRONTEND (dist)
///////////////////////////////

// Absolute path to dist inside backend folder
const distPath = path.join(__dirname, "dist");

// Serve static assets
app.use(express.static(distPath));

// For any non-API route, send back index.html (SPA fallback)
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ message: "API route not found" });
  }
  res.sendFile(path.join(distPath, "index.html"));
});

///////////////////////////////
//  START SERVER
///////////////////////////////
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
