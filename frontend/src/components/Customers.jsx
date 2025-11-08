import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import getImageUrl from "../utils/getImageUrl";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  // ✅ Fetch all users (admin)
  async function fetchCustomers() {
    try {
      const res = await api.get("/users"); // grid endpoint
      setCustomers(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    }
  }

  // ✅ Fetch single user with order details
  async function openDetails(customer) {
    setSelectedCustomer(customer);
    setLoading(true);
    try {
      const res = await api.get(`/users/${customer._id}`); // single customer endpoint
      setDetails({
        ...res,
        totalSpent: res.totalSpent || 0,
        totalOrders: res.totalOrders || 0,
        ordersByStatus: res.ordersByStatus || {},
      });
    } catch (err) {
      console.error("Failed to load customer details:", err);
      setDetails(null);
    } finally {
      setLoading(false);
    }
  }

  function closeModal() {
    setSelectedCustomer(null);
    setDetails(null);
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Customers</h2>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {customers.map((c) => (
          <div
            key={c._id}
            onClick={() => openDetails(c)}
            className="cursor-pointer border rounded-lg shadow p-4 flex flex-col items-center text-center bg-white hover:shadow-lg hover:bg-slate-50 transition"
          >
            <img
              src={getImageUrl(c.profileImage || "")}
              alt={c.fullName || c.email}
              className="w-20 h-20 object-cover rounded-full mb-3 border"
            />
            <h3 className="font-semibold text-lg">{c.fullName || "No Name"}</h3>
            <p className="text-sm text-gray-600">{c.email || "No Email"}</p>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative max-h-[90vh] overflow-y-auto p-6">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-xl"
            >
              ✕
            </button>

            {loading ? (
              <div className="text-center py-10 text-gray-500">Loading...</div>
            ) : details ? (
              <div className="text-center">
                <img
                  src={getImageUrl(details.profileImage || "")}
                  alt={details.fullName}
                  className="w-24 h-24 object-cover rounded-full mx-auto mb-3 border"
                />
                <h3 className="text-xl font-semibold mb-1">{details.fullName || "No Name"}</h3>
                <p className="text-gray-600 mb-2">{details.email || "No Email"}</p>

                {details.phone && <p className="text-gray-700">📞 <b>{details.phone}</b></p>}
                {details.address && <p className="text-gray-700 mb-3">📍 {details.address}</p>}

                <div className="border-t mt-3 pt-3 space-y-3 text-left">
                  <p className="text-sm text-gray-700">🛍️ <b>Total Orders:</b> {details.totalOrders}</p>
                  <p className="text-sm text-gray-700">💰 <b>Total Spent:</b> ₱{details.totalSpent.toFixed(2)}</p>

                  {/* Orders by Status */}
                  {details.ordersByStatus && Object.keys(details.ordersByStatus).length > 0 ? (
                    Object.keys(details.ordersByStatus).map((status) => (
                      <div key={status} className="mt-2">
                        <h4 className="font-semibold">{status} ({details.ordersByStatus[status]?.length || 0})</h4>
                        {details.ordersByStatus[status]?.length === 0 ? (
                          <p className="text-sm text-gray-500">No orders in this status.</p>
                        ) : (
                          <ul className="text-sm text-gray-700 space-y-2 max-h-60 overflow-y-auto border p-2 rounded">
                            {details.ordersByStatus[status].map((order) => (
                              <li key={order._id} className="border-b pb-1 mb-1">
                                <p><b>Order Total:</b> ₱{(order.total || 0).toFixed(2)} | <b>Date:</b> {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "N/A"}</p>
                                <ul className="ml-4 mt-1 space-y-1">
                                  {order.items && order.items.map((item) => (
                                    <li key={item._id}>
                                      {item.name} x {item.quantity} = ₱{(item.price * item.quantity).toFixed(2)}
                                    </li>
                                  ))}
                                </ul>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No orders available.</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Failed to load customer details.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
