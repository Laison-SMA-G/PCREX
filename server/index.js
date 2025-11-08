// server/index.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Routes
import productRoutes from "./routes/products.js";
import salesRoutes from "./routes/sales.js";
import customerRoutes from "./routes/customers.js";
import authRoutes from "./routes/auth.js";
import orderRoutes from "./routes/orders.js";

// Load env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5175;

// ✅ Correct environment variable name (case-sensitive)
const MONGO_URI = process.env.ATLAS_URL;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ CSP fix for images & blob previews
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; " +
      "img-src 'self' data: blob: http://127.0.0.1:5175; " +
      "script-src 'self'; style-src 'self' 'unsafe-inline';"
  );
  next();
});

// ✅ Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);

// ✅ Serve frontend build
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// ✅ SPA fallback for non-API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

// ✅ MongoDB connection
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB Atlas connection error:", err.message));

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ error: "Something broke!" });
});

// Start server
app.listen(PORT, "127.0.0.1", () =>
  console.log(`🌐 Server running at http://127.0.0.1:${PORT}`)
);
