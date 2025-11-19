import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";


// ✅ Routes
import productRoutes from "./routes/products.js";
import salesRoutes from "./routes/sales.js";
import customerRoutes from "./routes/customers.js";
import authRoutes from "./routes/auth.js";
import orderRoutes from "./routes/orders.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5175;
const MONGO_URI = process.env.ATLAS_URL;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// --------------------------------------------------
// ✅ Middleware
// --------------------------------------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// --------------------------------------------------
// ✅ Cloudinary-safe CSP (VERY IMPORTANT)
// --------------------------------------------------
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    `
      default-src 'self';
      img-src 'self' data: blob: https://res.cloudinary.com https://*.cloudinary.com;
      style-src 'self' 'unsafe-inline';
      script-src 'self';
    `.replace(/\n/g, "")
  );
  next();
});


// ❌ REMOVE this since Cloudinary is used now
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// --------------------------------------------------
// ✅ API Routes
// --------------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);   // ⬅ now uses Cloudinary
app.use("/api/sales", salesRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);


// --------------------------------------------------
// ✅ Serve React build (Desktop App / Web)
// --------------------------------------------------
app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});


// --------------------------------------------------
// ✅ MongoDB connection
// --------------------------------------------------
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));


// --------------------------------------------------
// ✅ Start server
// --------------------------------------------------
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🌐 Server running at http://127.0.0.1:${PORT}`);
});
