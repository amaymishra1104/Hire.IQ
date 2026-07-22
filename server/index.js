const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./db");

const app = express();

// ---------------------------
// CORS Configuration
// ---------------------------
const allowedOrigins = [
  "http://localhost:3000", // Local frontend
  process.env.FRONTEND_URL, // Production frontend (Vercel)
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no Origin (Render health checks, Postman, curl, mobile apps)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS Error: Origin '${origin}' is not allowed.`)
      );
    },
    credentials: true,
  })
);

app.use(express.json());

// ---------------------------
// Connect to MongoDB
// ---------------------------
connectDB();

// ---------------------------
// Routes
// ---------------------------
app.use("/interview", require("./routes/interview"));
app.use("/mentor", require("./routes/mentor"));
app.use("/resume", require("./routes/resume"));
app.use("/coach", require("./routes/coach"));

// ---------------------------
// Health Check
// ---------------------------
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "HireIQ API is running 🚀",
    environment: process.env.NODE_ENV || "development",
  });
});

// ---------------------------
// Start Server
// ---------------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 HireIQ Server running on port ${PORT}`);

  console.log("✅ Allowed Origins:");
  allowedOrigins.forEach((origin) => console.log(`   • ${origin}`));
});