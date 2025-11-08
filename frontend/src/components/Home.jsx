import React, { useEffect, useState } from 'react'
import { api } from '../api.js';

export default function Home() {
  const [totalProducts, setTotalProducts] = useState(0)
  const [salesToday, setSalesToday] = useState(0)
  const [lowStock, setLowStock] = useState([])
  const [restockAmount, setRestockAmount] = useState({}) // Track restock input

  useEffect(() => {
    fetchDashboard()
  }, [])

  async function fetchDashboard() {
    try {
      // Get products
      const products = await api.get('/products')
      setTotalProducts(products.length)

      // Filter low stock
      const low = products.filter(p => p.quantity <= 5)
      setLowStock(low)

      // Get today's sales
      const stats = await api.get('/sales/stats/day')
      setSalesToday(stats?.totalAmount || 0)
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    }
  }

  async function handleRestock(productId) {
    const amount = parseInt(restockAmount[productId]) || 0
    if (amount <= 0) return alert('Enter a valid restock amount')

    try {
      await api.put(`/products/restock/${productId}`, { amount })
      alert('Product restocked successfully!')
      setRestockAmount(prev => ({ ...prev, [productId]: '' }))
      fetchDashboard() // Refresh data
    } catch (err) {
      console.error('Failed to restock product:', err)
      alert('Failed to restock product')
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-blue-100 rounded shadow">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Total Products</h3>
          <p className="text-3xl font-bold">{totalProducts}</p>
        </div>
        <div className="p-6 bg-green-100 rounded shadow">
          <h3 className="text-lg font-medium text-green-800 mb-2">Sales Today (₱)</h3>
          <p className="text-3xl font-bold">{salesToday.toFixed(2)}</p>
        </div>
        <div className="p-6 bg-red-100 rounded shadow">
          <h3 className="text-lg font-medium text-red-800 mb-2">Low Stock Notifications</h3>
          {lowStock.length === 0 ? (
            <p>All products are stocked.</p>
          ) : (
            <ul className="space-y-2">
              {lowStock.map(p => (
                <li key={p._id} className="flex flex-col md:flex-row md:items-center md:justify-between border p-2 rounded bg-white">
                  <div>
                    <span className="font-semibold">{p.name}</span> — Qty: {p.quantity}
                  </div>
                  <div className="flex items-center gap-2 mt-2 md:mt-0">
                    <input
                      type="number"
                      min="1"
                      placeholder="Restock qty"
                      value={restockAmount[p._id] || ''}
                      onChange={e =>
                        setRestockAmount(prev => ({ ...prev, [p._id]: e.target.value }))
                      }
                      className="border rounded px-2 py-1 w-20"
                    />
                    <button
                      onClick={() => handleRestock(p._id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Restock
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
