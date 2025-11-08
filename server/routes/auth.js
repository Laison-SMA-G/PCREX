import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Default admin credentials (can override via .env)
const ADMIN_USERNAME = process.env.ADMIN_USER || "admin";
const ADMIN_PLAIN = process.env.ADMIN_PASS || "admin123";

let ADMIN_HASH = null;

// Hash password at server startup
(async () => {
  ADMIN_HASH = await bcrypt.hash(ADMIN_PLAIN, 10);
  console.log("✅ Admin account ready ->", ADMIN_USERNAME);
})();

// --- LOGIN ENDPOINT ---
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: "Username and password required" });

  if (username !== ADMIN_USERNAME)
    return res.status(401).json({ error: "Invalid credentials" });

  const isValid = await bcrypt.compare(password, ADMIN_HASH);
  if (!isValid)
    return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { username },
    process.env.JWT_SECRET || "super_secret_pcrex_key",
    { expiresIn: "12h" }
  );

  res.json({
    message: "Login successful",
    token,
    user: { username },
  });
});

// ✅ NEW: Verify token route
router.get("/verify", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET || "super_secret_pcrex_key", (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid or expired token" });
    res.json({ valid: true, user: decoded });
  });
});

export default router;
