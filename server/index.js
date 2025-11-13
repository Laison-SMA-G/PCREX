import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// ✅ Models
import Chat from "./models/Chat.js";

// ✅ Routes
import productRoutes from "./routes/products.js";
import salesRoutes from "./routes/sales.js";
import customerRoutes from "./routes/customers.js";
import authRoutes from "./routes/auth.js";
import orderRoutes from "./routes/orders.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const PORT = process.env.PORT || 5175;
const MONGO_URI = process.env.ATLAS_URL;
const ADMIN_ID = process.env.ADMIN_ID;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------------------------------------
// ✅ Middleware
// --------------------------------------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Make Socket.IO accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ✅ CSP fix for images
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' data: blob: http://127.0.0.1:5175; style-src 'self' 'unsafe-inline';"
  );
  next();
});

// ✅ Serve uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --------------------------------------------------
// ✅ API Routes
// --------------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);

// --------------------------------------------------
// 💬 Chat API
// --------------------------------------------------
app.get("/api/chats/user/:userId/admin", async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!ADMIN_ID)
      return res.status(500).json({ error: "ADMIN_ID not set in .env" });

    let chat = await Chat.findOne({
      participants: { $all: [userId, ADMIN_ID] },
    });

    if (!chat) {
      chat = await Chat.create({ participants: [userId, ADMIN_ID], messages: [] });
    }

    res.json(chat);
  } catch (err) {
    console.error("Failed to get or create chat:", err);
    res.status(500).json({ error: "Failed to get or create chat" });
  }
});

app.post("/api/chats/:chatId/message", async (req, res) => {
  try {
    const { sender, content } = req.body;
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ error: "Chat not found" });

    const message = { sender, content, timestamp: new Date() };
    chat.messages.push(message);
    await chat.save();

    io.to(req.params.chatId).emit("message", { chatId: req.params.chatId, message });
    res.json({ success: true });
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// --------------------------------------------------
// 🧠 Socket.IO setup
// --------------------------------------------------
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("joinChat", async ({ chatId }) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined chat ${chatId}`);
    const chat = await Chat.findById(chatId);
    if (chat) {
      socket.emit("chatHistory", chat.messages);
    }
  });

  socket.on("sendMessage", async ({ chatId, sender, content }) => {
    const chat = await Chat.findById(chatId);
    if (!chat) return;

    const message = { sender, content, timestamp: new Date() };
    chat.messages.push(message);
    await chat.save();

    io.to(chatId).emit("message", { chatId, message });
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

// --------------------------------------------------
// ✅ Serve React build
// --------------------------------------------------
app.use(express.static(path.join(__dirname, "../frontend/dist")));
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"))
);

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
  console.log(`✅ Socket.IO active`);
});
