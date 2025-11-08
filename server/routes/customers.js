import express from "express";
import User from "../models/User.js";
import Order from "../models/Order.js";

const router = express.Router();

// Get all customers with basic order info
router.get("/", async (req, res) => {
  try {
    const customers = await User.find({}, "name email profilePicture").lean();

    const customersWithOrders = await Promise.all(
      customers.map(async (c) => {
        const orders = await Order.find({ customerId: c._id }).select("status total orderDate").lean();
        return {
          ...c,
          totalOrders: orders.length,
          totalSpent: orders.reduce((sum, o) => sum + o.total, 0),
          orders,
        };
      })
    );

    res.json(customersWithOrders);
  } catch (err) {
    console.error("Error fetching customers:", err);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

// Get single customer details
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password").lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    const orders = await Order.find({ customerId: user._id }).lean();
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);

    res.json({
      ...user,
      totalOrders,
      totalSpent,
      orders,
    });
  } catch (err) {
    console.error("Error fetching customer details:", err);
    res.status(500).json({ error: "Failed to fetch customer details" });
  }
});

export default router;
