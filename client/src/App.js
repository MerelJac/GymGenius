import React, { useEffect, useState } from "react";
import "./App.css";
import "./index.css";
import "./assets/css/form.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { Dashboard } from "./components/Dashboard";
import { Header } from "./components/Header";
import { Create } from "./components/Create";
import { AccountOptions } from "./components/AccountOptions";
import { SeeStatsPage } from "./components/SeeStats";
import { NotFound } from "./components/NotFound";
import { PreviousWorkouts } from "./components/PreviousWorkouts";
import { RandomGenerator } from "./components/Random";

import { auth } from "./utils/auth";

function App() {
  const [authStatus, setAuthStatus] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const response = await auth();
      if (response) {
        setAuthStatus(true);
      }
    };
    checkAuth();
  }, [authStatus]);

  return (
    <BrowserRouter>
      <div className="App">
        <Header auth={authStatus} />
        <Routes>
          <Route exact path="/login" element={<Login />} />
          <Route exact path="/register" element={<Register />} />
          {authStatus && (
            <>
              <Route exact path="/" element={<Dashboard />} />
              <Route exact path="/create" element={<Create />} />
              <Route exact path="/random" element={<RandomGenerator />} />
              <Route exact path="/stats" element={<SeeStatsPage />} />
              <Route exact path="/account-info" element={<AccountOptions />} />
              <Route
                path="/previous-exercises"
                element={<PreviousWorkouts />}
              />
            </>
          )}
          {/* Add a 404 Not Found route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
