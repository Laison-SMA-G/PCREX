import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Home from './components/Home.jsx';
import Sales from './components/Sales.jsx';
import Products from './components/Products.jsx';
import Messages from './components/Messages.jsx';
import Sell from './components/Sell.jsx';
import Customers from "./components/Customers.jsx";
import Login from './components/Login.jsx';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [page, setPage] = useState('home');

  // Check localStorage for existing token on load
  useEffect(() => {
    const token = localStorage.getItem('pcrex_token');
    if (token) setIsLoggedIn(true);
  }, []);

  if (!isLoggedIn) {
    // Show login page if not logged in
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  // Show dashboard after login
  return (
    <div className="flex h-screen text-gray-800">
      <Sidebar onNavigate={setPage} isAuth={true} />
      <main className="flex-1 p-10 overflow-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-6">PCREX Admin</h1>
        {page === 'home' && <Home />}
        {page === 'sales' && <Sales />}
        {page === 'products' && <Products />}
        {page === 'sell' && <Sell />}
        {page === 'messages' && <Messages />}
        {page === 'customers' && <Customers />}
      </main>
    </div>
  );
}
