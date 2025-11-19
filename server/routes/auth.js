import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

// ------------------------------
// ADMIN CONFIG
// ------------------------------
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

// Hash password synchronously
const ADMIN_HASH = bcrypt.hashSync(ADMIN_PASSWORD, 10);
console.log("✅ Admin account ready ->", ADMIN_USERNAME);

// ------------------------------
// LOGIN ENDPOINT
// ------------------------------
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

// ------------------------------
// VERIFY TOKEN ENDPOINT
// ------------------------------
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
