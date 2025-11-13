// src/pages/Customers.jsx
import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import toast, { Toaster } from "react-hot-toast";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    setLoading(true);
    try {
      const data = await api.get("/customers");
      setCustomers(data);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      toast.error("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  }

  async function viewCustomerDetails(id) {
    try {
      const data = await api.get(`/customers/${id}`);
      setSelectedCustomer(data);
    } catch (err) {
      console.error("Failed to fetch customer details:", err);
      toast.error("Failed to fetch customer details");
    }
  }

  // ✅ Handle status change
  async function handleStatusChange(orderId, newStatus) {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success("Order status updated!");

      // Update state locally
      setSelectedCustomer((prev) => ({
        ...prev,
        orders: prev.orders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        ),
      }));
    } catch (err) {
      console.error("Failed to update order status:", err);
      toast.error("Failed to update order status");
    }
  }

  return (
    <div className="space-y-6 p-4">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-semibold">Customers</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Orders</th>
                <th className="p-3 text-left">Total Spent (₱)</th>
                <th className="p-3 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 flex items-center gap-2">
                    {c.profilePicture ? (
                      <img
                        src={c.profilePicture}
                        alt=""
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                    )}
                    {c.name}
                  </td>
                  <td className="p-3">{c.email}</td>
                  <td className="p-3">{c.totalOrders}</td>
                  <td className="p-3">{c.totalSpent.toFixed(2)}</td>
                  <td className="p-3">
                    <button
                      onClick={() => viewCustomerDetails(c._id)}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td className="p-3 text-center text-gray-500" colSpan={5}>
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedCustomer && (
        <div className="bg-white border rounded-lg p-6 shadow-md mt-6">
          <h3 className="text-xl font-semibold mb-3">
            {selectedCustomer.name}'s Details
          </h3>
          <p>Email: {selectedCustomer.email}</p>
          <p>Total Orders: {selectedCustomer.totalOrders}</p>
          <p>Total Spent: ₱{selectedCustomer.totalSpent.toFixed(2)}</p>

          <h4 className="mt-4 font-semibold text-gray-700">Order History:</h4>
          {selectedCustomer.orders.length === 0 ? (
            <p className="text-gray-500 mt-1">No orders yet.</p>
          ) : (
            <ul className="space-y-2 mt-2">
              {selectedCustomer.orders.map((order) => (
                <li
                  key={order._id}
                  className="border p-3 rounded bg-gray-50 flex justify-between items-center"
                >
                  <div>
                    <p>
                      <strong>Status:</strong>{" "}
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order._id, e.target.value)
                        }
                        className="border rounded px-2 py-1 ml-2"
                      >
                        <option value="To Ship">To Ship</option>
                        <option value="To Receive">To Receive</option>
                        <option value="To Review">To Review</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </p>
                    <p>Date: {new Date(order.orderDate).toLocaleDateString()}</p>
                    <p>Items: {order.items.map((i) => i.name).join(", ")}</p>
                  </div>
                  <p className="font-bold">₱{order.total.toFixed(2)}</p>
                </li>
              ))}
            </ul>
          )}

          <button
            onClick={() => setSelectedCustomer(null)}
            className="mt-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
