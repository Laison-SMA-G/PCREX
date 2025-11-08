import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import { api } from "./api";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("pcrex_token");
    if (!token) {
      setLoading(false);
      return;
    }

    // ✅ Verify token
    api
      .get("/auth/verify")
      .then(() => {
        setLoggedIn(true);
      })
      .catch(() => {
        localStorage.removeItem("pcrex_token");
        setLoggedIn(false);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        Checking session...
      </div>
    );
  }

  return loggedIn ? (
    <Dashboard
      onLogout={() => {
        localStorage.removeItem("pcrex_token");
        setLoggedIn(false);
      }}
    />
  ) : (
    <Login onLogin={() => setLoggedIn(true)} />
  );
}
