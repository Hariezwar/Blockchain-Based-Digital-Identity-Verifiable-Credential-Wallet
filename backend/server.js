const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const env = require("./config/env");
const authRoutes = require("./routes/authRoutes");
const didRoutes = require("./routes/didRoutes");
const issuerRoutes = require("./routes/issuerRoutes");

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/dids", didRoutes);
app.use("/api/issuer", issuerRoutes);
const verifierRoutes = require("./routes/verifierRoutes");
app.use("/api", verifierRoutes);

// Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start server
app.listen(env.port, () => {
  console.log(`Backend server running on http://localhost:${env.port}`);
});
