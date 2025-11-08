import React, { useEffect, useState } from "react";
import { api } from "../api.js";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const data = await api.get("/orders");
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  }

  async function updateStatus(orderId, newStatus) {
    setUpdatingId(orderId);
    try {
      const updated = await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? updated : o)));
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-semibold">Orders Management</h2>

      <table className="w-full border-collapse bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">Customer</th>
            <th className="p-2 border">Total</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id} className="border-t hover:bg-gray-50">
              <td className="p-2 border">{order.customerId?.name || "Unknown"}</td>
              <td className="p-2 border">₱{order.total?.toFixed(2)}</td>
              <td className="p-2 border">{order.status}</td>
              <td className="p-2 border">{new Date(order.orderDate).toLocaleDateString()}</td>
              <td className="p-2 border">
                {["To Pay", "To Ship", "To Receive", "Completed", "Cancelled"].map((s) => (
                  <button
                    key={s}
                    disabled={updatingId === order._id || order.status === s}
                    onClick={() => updateStatus(order._id, s)}
                    className={`px-2 py-1 text-sm rounded mr-1 ${
                      order.status === s
                        ? "bg-gray-300"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
