import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { Dashboard } from "./components/Dashboard";
import { Header } from "./components/Header";
import { Create } from "./components/Create";
import { AccountOptions } from "./components/AccountOptions";
import { SeeStatsPage } from "./components/SeeStats";
import { NotFound } from "./components/NotFound";
import { RandomGenerator } from "./components/Random";
import { auth } from "./utils/auth";

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const [authStatus, setAuthStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [username, setUsername] = useState("")

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await auth();
        if (response) {
          setAuthStatus(true);
        }
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [location.pathname, username, authStatus]); // Run the effect whenever the pathname changes

  if (loading) {
    // TODO: show a loading spinner or something while checking auth
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <Header auth={authStatus}  username={username}/>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {authStatus ? (
          <>
            <Route path="/home" element={<Dashboard setUsername={setUsername} />} />
            <Route path="/create" element={<Create />} />
            <Route path="/random" element={<RandomGenerator />} />
            <Route path="/stats" element={<SeeStatsPage />} />
            <Route path="/account-info" element={<AccountOptions />} />
          </>
        ) : (
          <Route path="*" element={<NotFound />} />
        )}
      </Routes>
    </div>
  );
}

export default App;

