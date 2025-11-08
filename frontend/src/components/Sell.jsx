import React, { useState, useEffect } from "react";
import { api } from '../api.js';

export default function Sell() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Categories
  const categories = ["All", "Components", "Peripherals", "Accessories", "Pre-Built"];
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Fetch products
  async function fetchProducts(query = "") {
    try {
      const res = await api.get(`/products?search=${encodeURIComponent(query)}`);
      setProducts(res);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  function handleSearch(e) {
    const value = e.target.value;
    setSearch(value);
    fetchProducts(value);
  }

  // Add product to cart
  function addToCart(product) {
    if (product.quantity <= 0) {
      alert("This product is out of stock!");
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item._id === product._id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  }

  function increaseQty(id) {
    setCart((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, qty: item.qty + 1 } : item
      )
    );
  }

  function decreaseQty(id) {
    setCart((prev) =>
      prev
        .map((item) =>
          item._id === id ? { ...item, qty: Math.max(item.qty - 1, 1) } : item
        )
        .filter((item) => item.qty > 0)
    );
  }

  function removeItem(id) {
    setCart((prev) => prev.filter((item) => item._id !== id));
  }

  // Submit sale
  async function submitSale() {
    setLoading(true);
    try {
      for (let item of cart) {
        // Use 'quantity' instead of 'stock'
        await api.post("/sales", {
          productId: item._id,
          quantity: item.qty,
          amount: item.price * item.qty,
        });

        await api.put(`/products/decrease/${item._id}`, { quantity: item.qty });
      }
      alert("Sale added successfully!");
      setCart([]);
      fetchProducts(search); // refresh products after sale
    } catch (err) {
      console.error("Failed to submit sale:", err);
      alert("Failed to submit sale");
    }
    setLoading(false);
  }

  // Filter products by category
  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="relative p-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5">
        <input
          type="text"
          placeholder="Search product..."
          value={search}
          onChange={handleSearch}
          className="w-full sm:w-72 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 order-1 sm:order-none"
        />
        <h1 className="text-2xl font-bold text-gray-800 mt-3 sm:mt-0 sm:ml-4 text-right">
          Sell Products
        </h1>
      </div>

      {/* Category Filter Buttons */}
      <div className="flex gap-3 mb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-md text-sm font-medium border ${
              selectedCategory === cat
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
        {filteredProducts.map((p) => (
          <div
            key={p._id}
            className={`bg-white rounded-2xl shadow-md transition p-4 flex flex-col items-center text-center
              ${p.quantity <= 0 ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg cursor-pointer"}`}
            onClick={() => p.quantity > 0 && addToCart(p)}
          >
            <img
              src={p.images?.[0]}
              alt={p.name}
              className="w-24 h-24 object-cover rounded-xl mb-3"
            />
            <h3 className="font-semibold text-gray-700 truncate w-full">{p.name}</h3>
            <p className="text-blue-600 font-medium mt-1">₱{p.price}</p>
            <p className="text-xs text-gray-500">
              Stock: {p.quantity > 0 ? p.quantity : "Out of Stock"}
            </p>
          </div>
        ))}
      </div>

      {/* Floating Cart Popup */}
      {cart.length > 0 && (
        <div className="fixed top-5 right-5 bg-white border border-gray-200 rounded-xl shadow-lg w-80 max-h-[80vh] overflow-y-auto p-4 z-50">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">🛒 Selected Items</h2>

          {cart.map((item) => (
            <div key={item._id} className="flex items-center justify-between mb-3 border-b pb-2">
              <img
                src={item.images?.[0]}
                alt={item.name}
                className="w-12 h-12 object-cover rounded-lg"
              />
              <div className="flex-1 px-2">
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-xs text-gray-500">
                  ₱{item.price} × {item.qty} = ₱{item.price * item.qty}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => decreaseQty(item._id)}
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  −
                </button>
                <span className="px-2 text-sm font-semibold text-gray-700">{item.qty}</span>
                <button
                  onClick={() => increaseQty(item._id)}
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => removeItem(item._id)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}

          <div className="mt-4 border-t pt-3">
            <p className="font-semibold text-right text-gray-700">
              Total: ₱{cart.reduce((sum, i) => sum + i.price * i.qty, 0)}
            </p>
            <button
              onClick={submitSale}
              disabled={loading}
              className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
            >
              {loading ? "Processing..." : "Submit Sale"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
