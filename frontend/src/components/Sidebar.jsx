import React, { useState } from 'react'

const items = [
  { id: 'home', label: 'Dashboard', icon: '📊' },
  { id: 'sales', label: 'Sales', icon: '📈' },
  { id: 'products', label: 'Products', icon: '📦' },
  { id: 'sell', label: 'Sell', icon: '💰' },
  { id: 'messages', label: 'Messages', icon: '✉️' },
  { id: 'customers', label: 'Customers', icon: '👥' }
]

export default function Sidebar({ onNavigate, isAuth, onLogout }) {
  const [hover, setHover] = useState(false)
  const [activeItem, setActiveItem] = useState('home')

  const handleNavigation = (id) => {
    setActiveItem(id)
    onNavigate(id)
  }

  const handleLogout = () => {
    localStorage.removeItem('pcrex_token') // remove saved token
    if (onLogout) onLogout()               // notify parent to show login page
  }

  return (
    <aside
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`transition-all duration-300 ease-in-out
                  ${hover ? 'w-56' : 'w-20'}
                  bg-gradient-to-br from-slate-900 to-slate-800
                  text-white flex flex-col items-start p-4
                  shadow-lg z-20`}
      style={{ minWidth: hover ? 220 : 80 }}
    >
      <div className="mb-8 w-full">
        <div className="text-3xl font-extrabold pl-2 flex items-center gap-2">
          {hover ? (
            <>
              <span className="text-blue-400">PCREX</span> Admin
            </>
          ) : (
            <span className="text-blue-400">PC</span>
          )}
        </div>
      </div>
      <nav className="flex-1 w-full space-y-2">
        {items.map(it => (
          <button
            key={it.id}
            onClick={() => handleNavigation(it.id)}
            className={`flex items-center w-full py-3 px-3 rounded-lg
                        transition-colors duration-200 ease-in-out
                        ${activeItem === it.id ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-700 text-slate-200 hover:text-white'}
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800`}
          >
            <div className={`w-8 h-8 rounded-full mr-3 flex items-center justify-center text-lg
                            ${activeItem === it.id ? 'bg-white text-blue-600' : 'bg-slate-700 text-slate-400'}`}>
              {it.icon}
            </div>
            {hover && <span className="font-medium text-lg">{it.label}</span>}
          </button>
        ))}
      </nav>
      {isAuth && (
        <div className="w-full mt-auto pt-6 border-t border-slate-700 text-slate-400 text-sm pl-2">
          <button
            onClick={handleLogout}
            className="flex items-center w-full py-2 px-3 rounded-lg hover:bg-slate-700 hover:text-white"
          >
            <span className="w-8 h-8 rounded-full mr-3 flex items-center justify-center text-lg bg-slate-700">➡️</span>
            {hover && <span className="font-medium text-lg">Logout</span>}
          </button>
          <div className="ml-auto text-xs text-white/70 mt-4 pl-2">v1.3</div>
        </div>
      )}
    </aside>
  )
}
