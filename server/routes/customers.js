// routes/customers.js
import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js"; // your existing user model
import Order from "../models/Order.js"; // your orders collection

const router = express.Router();

// GET all customers with totalOrders and totalSpent
router.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    const customers = await Promise.all(
      users.map(async (user) => {
        const orders = await Order.find({ user: user._id });
        const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);
        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture || null,
          totalOrders: orders.length,
          totalSpent,
        };
      })
    );
    res.json(customers);
  } catch (err) {
    console.error("Error fetching customers:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET a single customer with their orders
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "Customer not found" });

    const orders = await Order.find({ user: user._id }).sort({ orderDate: -1 });

    const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture || null,
      totalOrders: orders.length,
      totalSpent,
      orders,
    });
  } catch (err) {
    console.error("Error fetching customer details:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
