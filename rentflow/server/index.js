require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// 1. --- IMPORT ROUTES ---
const bookingRoutes = require("./routes/bookings");
const propertyRoutes = require("./routes/properties");
const maintenanceRoutes = require("./routes/maintenance");
const transactionRoutes = require("./routes/transactions");
const noticeRoutes = require("./routes/notice");
const dashboardRoutes = require("./routes/dashboard");
const profileRoutes = require("./routes/profile");
const loginRoute = require("./routes/login");

const app = express();

// 2. --- MIDDLEWARE ---

// List all URLs allowed to talk to your backend
const allowedOrigins = [
  "http://localhost:5173",
  "https://rent-flow-lilac.vercel.app",
  "https://rent-flow-15hmrfeck-satyajits-projects-9502c1f8.vercel.app", // Your Vercel Preview URL
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps) or if in allowedOrigins list
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  // CRITICAL: Added PATCH and OPTIONS here
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Apply the single CORS configuration
app.use(cors(corsOptions));

// Handle the browser's "Preflight" (OPTIONS) request globally
app.options("*", cors(corsOptions));

// JSON and URL Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. --- DATABASE CONNECTION ---
connectDB();

// 4. --- ROUTE REGISTRATION ---
// This tells Express to use the logic inside your /routes/ files.
app.use("/api/bookings", bookingRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/login", loginRoute);

// 5. --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
