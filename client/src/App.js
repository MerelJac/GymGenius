import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
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
import axios from "axios";
import {
  RouterProvider,
  createBrowserRouter,
  useNavigate,
} from "react-router-dom";
import { useRef, createContext, useContext, useCallback } from "react";

// Ensures cookie is sent
axios.defaults.withCredentials = true;
const serverUrl = process.env.REACT_APP_SERVER_URL;

const AuthContext = createContext();
export { AuthContext };

const AuthContextProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(null);
  const [user, setUser] = useState(null);

  const checkLoginState = useCallback(async () => {
    try {
      const {
        data: { loggedIn: logged_in, user },
      } = await axios.get(`${serverUrl}/auth/logged_in`);
      setLoggedIn(logged_in);
      user && setUser(user);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    checkLoginState();
  }, [checkLoginState]);

  return (
    <AuthContext.Provider value={{ loggedIn, checkLoginState, user }}>
      {children}
    </AuthContext.Provider>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/auth/callback", // google will redirect here
    element: <Dashboard />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/home",
    element: <Dashboard />,
  },
  {
    path: "/create",
    element: <Create />,
  },
  {
    path: "/random",
    element: <RandomGenerator />,
  },
  {
    path: "/stats",
    element: <SeeStatsPage />,
  },
  {
    path: "/account-info",
    element: <AccountOptions />,
  },
  {
    path: "/header",
    element: <Header />,
  },

  {
    path: "*",
    element: <NotFound />,
  },
]);

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <AuthContextProvider>
          <RouterProvider router={router} />
        </AuthContextProvider>
      </header>
    </div>
  );
}

export default App;

// const AuthContext = createContext();
// export { AuthContext };

// const AuthContextProvider = ({ children }) => {
//   const [loggedIn, setLoggedIn] = useState(null);
//   const [user, setUser] = useState(null);

//   const checkLoginState = useCallback(async () => {
//     try {
//       const {
//         data: { loggedIn: logged_in, user },
//       } = await axios.get(`${serverUrl}/auth/logged_in`);
//       setLoggedIn(logged_in);
//       user && setUser(user);
//     } catch (err) {
//       console.error(err);
//     }
//   }, []);

//   useEffect(() => {
//     checkLoginState();
//   }, [checkLoginState]);

//   return (
//     <AuthContext.Provider value={{ loggedIn, checkLoginState, user }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// function App() {
//   return (
//     <BrowserRouter>
//       <AppContent />
//     </BrowserRouter>
//   );
// }

// function App() {
//   return (
//     <div className="App">
//       <Header />
//         <AuthContextProvider>
//           <RouterProvider router={router} />
//         </AuthContextProvider>
//     </div>
//   );
// }

// function AppContent() {
//   const [authStatus, setAuthStatus] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const location = useLocation();

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const response = await auth();
//         console.log(response);
//         if (response) {
//           setAuthStatus(true);
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     checkAuth();
//   }, [location.pathname]); // Run the effect whenever the pathname changes

//   if (loading) {
//     // TODO: show a loading spinner or something while checking auth
//     return <div>Loading...</div>;
//   }

//   return (
//     <div className="App">
//       <Header auth={authStatus} />
//       <Routes>
//         <Route path="/" element={<Navigate to="/login" />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />
//         {authStatus ? (
//           <>
//             <Route path="/home" element={<Dashboard />} />
//             <Route path="/create" element={<Create />} />
//             <Route path="/random" element={<RandomGenerator />} />
//             <Route path="/stats" element={<SeeStatsPage />} />
//             <Route path="/account-info" element={<AccountOptions />} />
//           </>
//         ) : (
//           <Route path="*" element={<NotFound />} />
//         )}
//       </Routes>
//     </div>
//   );
// }