import React, { useEffect, useState } from 'react'
import { api } from '../api.js';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export default function Sales() {
  const [period, setPeriod] = useState('week')
  const [stats, setStats] = useState({ totalAmount: 0, count: 0 })
  const [chartData, setChartData] = useState({ labels: [], datasets: [] })
  const [topProducts, setTopProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStats()
    fetchChart()
    fetchTopProducts()
  }, [period])

  async function fetchStats() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(`/sales/stats/${period}`)
      const data = res ?? { totalAmount: 0, count: 0 }
      setStats({
        totalAmount: Number(data.totalAmount) || 0,
        count: Number(data.count) || 0
      })
    } catch (e) {
      console.error("Error fetching sales stats:", e)
      setError("Failed to load sales statistics.")
      setStats({ totalAmount: 0, count: 0 })
    } finally {
      setLoading(false)
    }
  }

  async function fetchChart() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/sales')
      const sales = Array.isArray(res) ? res : []
      const now = new Date()
      let labels = [], buckets = {}

      const formatLabel = (date) => {
        if (period === 'day' || period === 'week') 
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        if (period === 'month') 
          return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
        return date.toLocaleDateString()
      }

      if (period === 'week') {
        for (let i = 6; i >= 0; i--) {
          const d = new Date()
          d.setDate(now.getDate() - i)
          labels.push(formatLabel(d))
        }
      } else if (period === 'month') {
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
        for (let i = daysInMonth - 1; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
          labels.push(formatLabel(d))
        }
      } else if (period === 'day') {
        labels = ['Today']
      }

      sales.forEach(s => {
        const d = new Date(s.createdAt)
        const k = formatLabel(d)
        buckets[k] = (buckets[k] || 0) + (s.amount || 0)
      })

      const data = labels.map(l => buckets[l] || 0)

      setChartData({
        labels,
        datasets: [{
          label: 'Sales Amount (₱)',
          data,
          fill: true,
          backgroundColor: 'rgba(59,130,246,0.15)',
          borderColor: 'rgb(37,99,235)',
          tension: 0.4,
          pointBackgroundColor: 'rgb(37,99,235)',
          pointBorderColor: '#fff',
          pointHoverRadius: 6,
        }]
      })
    } catch (e) {
      console.error("Error fetching sales chart data:", e)
      setError("Failed to load sales chart data.")
      setChartData({ labels: [], datasets: [] })
    } finally {
      setLoading(false)
    }
  }

  // ✅ Fetch top 10 products for the selected period
  async function fetchTopProducts() {
    try {
      const res = await api.get(`/sales/top/${period}`)
      setTopProducts(Array.isArray(res) ? res.slice(0, 10) : [])
    } catch (e) {
      console.error("Error fetching top products:", e)
      setTopProducts([])
    }
  }

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: {
      display: true,
      text: `Sales Performance (${period})`,
      font: { size: 18, weight: 'bold' },
      color: '#1e293b'
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || ''
          if (label) label += ': '
          if (context.parsed.y !== null) label += `₱${context.parsed.y.toLocaleString()}`
          return label
        }
      }
    }
  },
  interaction: {
    mode: 'nearest',
    axis: 'x',
    intersect: false
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        color: '#475569',
        callback: v => `₱${v.toLocaleString()}`
      },
      grid: {
        color: 'rgba(226,232,240,0.5)',
        drawBorder: false,
        drawTicks: false
      }
    },
    x: {
      ticks: { color: '#475569' },
      grid: { display: false }
    }
  },
  elements: {
    line: {
      tension: 0.4,               // smoother curves
      borderWidth: 3,             // thicker line for clarity
      borderColor: 'rgb(37,99,235)',
      fill: true,
      backgroundColor: 'rgba(59,130,246,0.15)'
    },
    point: {
      radius: 5,
      hoverRadius: 7,
      backgroundColor: 'rgb(37,99,235)',
      borderColor: '#fff',
      borderWidth: 2
    }
  }
}



  return (
    <div className="space-y-8">
      <div className="card p-6 shadow-md">
        <h3 className="text-2xl font-semibold text-slate-900 mb-4">Sales Report</h3>
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            {['day','week','month'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 text-sm font-medium border ${
                  period === p ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                } ${p === 'day' ? 'rounded-l-lg' : p === 'month' ? 'rounded-r-lg' : ''}`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          <div className="ml-auto text-sm text-slate-600 font-medium">
            Total ({period}): <strong>{stats.count}</strong> sales • 
            <strong className="text-green-600"> ₱{stats.totalAmount.toFixed(2)}</strong>
          </div>
        </div>

        <div className="mt-8 bg-slate-50 rounded-lg p-6 h-[400px]">
          {chartData.labels.length ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <div className="text-center text-slate-500 py-20">No data to display</div>
          )}
        </div>
      </div>

      {/* ✅ Top 10 Products Section */}
      <div className="card p-6 shadow-md">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">
          Top 10 Products This {period === 'month' ? 'Month' : 'Week'}
        </h3>

        {topProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topProducts.map((p, i) => (
              <div 
                key={i} 
                className="flex items-center bg-slate-50 rounded-xl p-3 shadow-sm hover:shadow transition"
              >
                <img 
                  src={(p.images && p.images[0]) || '/placeholder.png'} 
                  alt={p.name} 
                  className="w-14 h-14 object-cover rounded-md mr-3"
                />
                <div className="flex-1">
                  <div className="font-medium text-slate-800">{i + 1}. {p.name}</div>
                  <div className="text-sm text-slate-500">Sold: {p.totalSold}</div>
                  <div className="text-xs text-green-600 font-medium">₱{p.totalAmount.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-slate-500 text-center py-8">
            No top-selling products yet
          </div>
        )}
      </div>
    </div>
  )
}
