import { useEffect, useState } from "react";
import api from "../api.js";
import ProductForm from "./ProductForm";
import getImageUrl from "../utils/getImageUrl";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Fetch products
  const loadProducts = async (selectedCategory = categoryFilter) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== "All") {
        params.append("category", selectedCategory);
      }

      const res = await api.get(`/products?${params.toString()}`);
      setProducts(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Error loading products:", err);
      setError("Failed to load products. Please try again.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      alert("Product removed successfully");
      loadProducts();
    } catch (err) {
      console.error(err);
      alert("Failed to remove product");
    }
  };

  return (
    <div className="space-y-6">
      {/* Add/Edit Product Form */}
      <div className="card p-6">
        <h2 className="text-2xl font-semibold mb-4 text-slate-900">
          {editingProduct ? "Edit Product" : "Add New Product"}
        </h2>
        <ProductForm
          product={editingProduct}
          onSaved={() => {
            setEditingProduct(null);
            loadProducts();
          }}
          onCancel={() => setEditingProduct(null)}
        />
      </div>

      {/* Product List */}
      <div className="card p-6">
        <h2 className="text-2xl font-semibold mb-4 text-slate-900">Product List</h2>

        {/* Category Filter */}
        <div className="flex justify-end mb-4">
          <select
            value={categoryFilter}
            onChange={(e) => {
              const selected = e.target.value;
              setCategoryFilter(selected);
              loadProducts(selected);
            }}
            className="p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition"
          >
            <option value="All">All Categories</option>
            <option value="Components">Components</option>
            <option value="Peripherals">Peripherals</option>
            <option value="Accessories">Accessories</option>
            <option value="Pre-built">Pre-built</option>
            <option value="Others">Others</option>
          </select>
        </div>

        {loading && <div className="text-center text-slate-500">Loading products...</div>}
        {error && <div className="text-center text-red-500">{error}</div>}
        {!loading && !error && products.length === 0 && (
          <div className="text-center text-slate-500">No products found.</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {products.map((p) => (
            <div
              key={p._id}
              className="card p-4 flex flex-col items-center text-center border rounded-lg shadow-sm hover:shadow-md transition"
            >
              {p.images && p.images.length > 0 ? (
                <img
                  src={getImageUrl(p.images[0])}
                  alt={p.name}
                  className="w-full h-32 object-cover rounded"
                />
              ) : (
                <div className="w-full h-32 bg-slate-200 flex items-center justify-center text-slate-500 rounded mb-3">
                  No Image
                </div>
              )}

              <b className="text-lg font-medium text-slate-800 truncate w-full">{p.name}</b>
              <p className="text-slate-600">₱{parseFloat(p.price).toFixed(2)}</p>
              <p className={`text-sm ${p.quantity < 5 ? "text-red-600 font-bold" : "text-slate-500"}`}>
                Qty: {p.quantity} {p.quantity < 5 && "(Low Stock!)"}
              </p>
              <p className="text-sm text-slate-600 italic">Category: {p.category || "Others"}</p>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-2 flex-wrap justify-center">
                {/* Edit Product */}
                <button
                  className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  onClick={() => setEditingProduct(p)}
                >
                  Edit
                </button>

                {/* Inline Edit Stock */}
                <button
                  className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={async () => {
                    const input = prompt("Enter new quantity:");
                    const qty = Number(input);
                    if (qty < 0 || isNaN(qty)) {
                      alert("Invalid quantity");
                      return;
                    }
                    try {
                      await api.put(`/products/edit/${p._id}`, { quantity: qty });
                      alert(`Quantity updated to ${qty}`);
                      loadProducts();
                    } catch (err) {
                      console.error("Update quantity error:", err);
                      alert("Failed to update quantity");
                    }
                  }}
                >
                  Edit Stock
                </button>

                {/* Restock Product */}
                <button
                  className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={async () => {
                    const input = prompt("Enter quantity to restock:");
                    const amount = Number(input);
                    if (!amount || amount <= 0) {
                      alert("Invalid restock amount");
                      return;
                    }
                    try {
                      await api.put(`/products/restock/${p._id}`, { amount });
                      alert(`Successfully restocked ${p.name} by ${amount}`);
                      loadProducts();
                    } catch (err) {
                      console.error("Restock error:", err);
                      alert("Failed to restock. See console for details.");
                    }
                  }}
                >
                  Restock
                </button>

                {/* Remove Product */}
                <button
                  className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={() => handleDelete(p._id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
