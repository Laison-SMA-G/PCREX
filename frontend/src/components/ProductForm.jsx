import React, { useEffect, useState } from "react";
import api from "../api.js";
import getImageUrl from "../utils/getImageUrl";

export default function ProductForm({ product, onSaved, onCancel }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setPrice(product.price || "");
      setQuantity(product.quantity || "");
      setDescription(product.description || "");
      setCategory(product.category || "");
      setExistingImages(product.images || []);
      setPreviews([]);
    } else {
      setName("");
      setPrice("");
      setQuantity("");
      setDescription("");
      setCategory("");
      setExistingImages([]);
      setPreviews([]);
    }
  }, [product]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData();
    fd.append("name", name);
    fd.append("price", price);
    fd.append("quantity", quantity);
    fd.append("description", description);
    fd.append("category", category);

    const files = Array.from(e.target.images?.files || []).slice(0, 3);
    files.forEach((file) => fd.append("images", file));

    try {
      if (product) {
        await api.put(`/products/edit/${product._id}`, fd);
        alert("Product updated!");
      } else {
        await api.post("/products", fd);
        alert("Product added!");
      }
      setPreviews([]);
      setExistingImages([]);
      onSaved && onSaved();
    } catch (err) {
      console.error("Save failed:", err.response ? err.response.data : err);
      alert(
        "Error saving product: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Product Name"
        className="p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition"
        required
      />
      <input
        name="price"
        type="number"
        value={price}
        step="0.01"
        min="0"
        onChange={(e) => setPrice(e.target.value)}
        placeholder="Price"
        className="p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition"
        required
      />
      <input
        name="quantity"
        type="number"
        value={quantity}
        min="0"
        onChange={(e) => setQuantity(e.target.value)}
        placeholder="Stock"
        className="p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition"
        required
      />
      <textarea
        name="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Product Information (optional)"
        rows="2"
        className="p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition col-span-1 md:col-span-2"
      />

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div className="col-span-1 md:col-span-2 flex gap-2 mt-2 flex-wrap">
          {existingImages.map((src, i) => (
            <img
              key={i}
              src={getImageUrl(src)}
              alt={`Existing ${i + 1}`}
              className="w-24 h-24 object-cover rounded border"
            />
          ))}
        </div>
      )}

      {/* Category Selection */}
      <div className="col-span-1 md:col-span-2">
        <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">
          Select Category
        </label>
        <select
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="block w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition"
          required
        >
          <option value="" disabled>
            -- Select Category --
          </option>
          <option value="Components">Components</option>
          <option value="Peripherals">Peripherals</option>
          <option value="Accessories">Accessories</option>
          <option value="Pre-built">Pre-built</option>
          <option value="Others">Others</option>
        </select>
      </div>

      {/* New Image Upload */}
      <div className="col-span-1 md:col-span-2">
        <label htmlFor="images-upload" className="block text-sm font-medium text-slate-700 mb-1">
          Upload New Images (up to 3)
        </label>
        <input
          id="images-upload"
          name="images"
          type="file"
          accept="image/*"
          multiple
          className="block w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
          onChange={handleFileChange}
        />

        {previews.length > 0 && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {previews.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`Preview ${i + 1}`}
                className="w-24 h-24 object-cover rounded border"
              />
            ))}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="col-span-1 md:col-span-2 flex gap-3 mt-2">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Saving..." : product ? "Update Product" : "Add Product"}
        </button>
        {product && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-200 text-slate-800 font-semibold rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
