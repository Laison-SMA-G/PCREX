import React, { useEffect, useState } from "react";
import { api } from "../api.js";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Derived states
  const activeOrders = orders.filter(o => o.status !== "Completed");
  const completedOrders = orders.filter(o => o.status === "Completed");

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const data = await api.get("/orders");
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      alert("Failed to fetch orders");
    }
  }

  async function updateStatus(id, status) {
    try {
      await api.put(`/orders/${id}/status`, { status });

      // Update the local state instantly for visual feedback
      setOrders(prev =>
        prev.map(o => (o._id === id ? { ...o, status } : o))
      );
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status");
    }
  }

  return (
    <div className="space-y-10">
      {/* Active Orders with counter */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Active Orders</h2>
          <span className="text-gray-600 font-medium">
            Total Active:{" "}
            <span className="text-blue-600 font-bold">{activeOrders.length}</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-left">Total (₱)</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Change Status</th>
                <th className="p-3 text-left">Details</th>
              </tr>
            </thead>
            <tbody>
              {activeOrders.map(o => (
                <tr key={o._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{o.customerId?.name || "Unknown"}</td>
                  <td className="p-3 font-bold">₱{o.total?.toFixed(2) || 0}</td>
                  <td className="p-3">{o.status}</td>
                  <td className="p-3">{new Date(o.orderDate).toLocaleDateString()}</td>
                  <td className="p-3">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o._id, e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      <option>To Pay</option>
                      <option>To Ship</option>
                      <option>To Receive</option>
                      <option>Completed</option>
                      <option>Cancelled</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => setSelectedOrder(o)}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {activeOrders.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-3 text-center text-gray-500">
                    No active orders.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Completed Orders */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Order History (Completed)</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-left">Total (₱)</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Details</th>
              </tr>
            </thead>
            <tbody>
              {completedOrders.map(o => (
                <tr key={o._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{o.customerId?.name || "Unknown"}</td>
                  <td className="p-3 font-bold">₱{o.total?.toFixed(2) || 0}</td>
                  <td className="p-3 text-green-600 font-semibold">{o.status}</td>
                  <td className="p-3">{new Date(o.orderDate).toLocaleDateString()}</td>
                  <td className="p-3">
                    <button
                      onClick={() => setSelectedOrder(o)}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {completedOrders.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-3 text-center text-gray-500">
                    No completed orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-semibold mb-4">
              Order Details (₱{selectedOrder.total?.toFixed(2) || 0})
            </h3>

            <h4 className="font-semibold text-gray-700">Items:</h4>
            <ul className="mb-4 space-y-2">
              {(selectedOrder.items || []).map(item => (
                <li key={item._id} className="flex justify-between border p-2 rounded bg-gray-50">
                  <div>
                    <p>{item.name}</p>
                    <p>Qty: {item.quantity}</p>
                  </div>
                  <p className="font-bold">₱{item.price?.toFixed(2) || 0}</p>
                </li>
              ))}
            </ul>

            <h4 className="font-semibold text-gray-700">Shipping:</h4>
            <p>
              {selectedOrder.shippingAddress?.fullName} <br />
              {selectedOrder.shippingAddress?.addressLine1}, {selectedOrder.shippingAddress?.city} <br />
              {selectedOrder.shippingAddress?.postalCode}, {selectedOrder.shippingAddress?.country} <br />
              Phone: {selectedOrder.shippingAddress?.phoneNumber}
            </p>

            <p className="mt-2">Payment: {selectedOrder.paymentMethod}</p>
            <p>Shipping Provider: {selectedOrder.shippingProvider?.name} ({selectedOrder.shippingProvider?.estimatedDays})</p>

            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
