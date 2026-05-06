import React, { useEffect, useState } from 'react'
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom'
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './components/Login';
import axios from 'axios';
import Income from './pages/Income';
import Expense from './pages/Expense';
import Profile from './pages/Profile';
import CreateAccount from './components/CreateAccount';
import VerifyEmail from './components/VerifyEmail';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

// decode JWT expiry
const getTokenExpiry = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000;
  } catch {
    return null;
  }
};

const getTransactionsFromStorage = () => {
  const saved = localStorage.getItem("transactions");
  return saved ? JSON.parse(saved) : [];
};

const ProtectedRoute = ({ children }) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  return token ? children : <Navigate to="/login" replace />;
};

const ScrollToTop = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [location.pathname]);

  return null;
};

const App = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const persistAuth = (userObj, tokenStr, remember = false) => {
    try {
      if (remember) {
        if (userObj) localStorage.setItem("user", JSON.stringify(userObj));
        if (tokenStr) localStorage.setItem("token", tokenStr);
        sessionStorage.clear();
      } else {
        if (userObj) sessionStorage.setItem("user", JSON.stringify(userObj));
        if (tokenStr) sessionStorage.setItem("token", tokenStr);
        localStorage.clear();
      }
      setUser(userObj || null);
      setToken(tokenStr || null);
    } catch (err) {
      console.error("persistAuth error:", err);
    }
  };

  const clearAuth = () => {
    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
    setToken(null);
  };

  const updateUserData = (updatedUser) => {
    setUser(updatedUser);
    const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
    storage.setItem("user", JSON.stringify(updatedUser));
  };

  // AUTH BOOTSTRAP
  useEffect(() => {
    (async () => {
      try {
        const localUser = localStorage.getItem("user");
        const sessionUser = sessionStorage.getItem("user");
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        const storedUser = localUser
          ? JSON.parse(localUser)
          : sessionUser
            ? JSON.parse(sessionUser)
            : null;

        if (storedUser && token) {
          try {
            const res = await axios.get(`${API_URL}/api/user/me`, {
              headers: { Authorization: `Bearer ${token}` }
            });

            persistAuth(res.data.user, token, !!localStorage.getItem("token"));
          } catch {
            clearAuth();
          }
        }
      } catch (err) {
        console.error("Auth error:", err);
      } finally {
        setIsLoading(false);
        setTransactions(getTransactionsFromStorage());
      }
    })();
  }, []);

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  // AUTO LOGOUT (IDLE)
  useEffect(() => {
    let timer;
    const TIMEOUT = 15 * 60 * 1000;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        clearAuth();
        navigate("/login");
        alert("Session expired. Please login again.");
      }, TIMEOUT);
    };

    ["click", "mousemove", "keydown"].forEach(event =>
      window.addEventListener(event, resetTimer)
    );

    resetTimer();

    return () => {
      clearTimeout(timer);
      ["click", "mousemove", "keydown"].forEach(event =>
        window.removeEventListener(event, resetTimer)
      );
    };
  }, []);

  // TOKEN EXPIRY LOGOUT
  useEffect(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!token) return;

    const expiryTime = getTokenExpiry(token);
    if (!expiryTime) return;

    const remainingTime = expiryTime - Date.now();

    if (remainingTime <= 0) {
      clearAuth();
      navigate("/login");
      return;
    }

    const timer = setTimeout(() => {
      clearAuth();
      navigate("/login");
      alert("Session expired. Please login again.");
    }, remainingTime);

    return () => clearTimeout(timer);
  }, [token]);

  // 401 AUTO LOGOUT
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401) {
          clearAuth();
          navigate("/login");
          alert("Session expired. Please login again.");
        }
        return Promise.reject(err);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  // FIXED TOKEN CHECK (important)
  useEffect(() => {
  const publicRoutes = ["/login", "/create-account", "/verify-email"];

  const checkAuth = () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    const currentPath = window.location.pathname;

    //  PUBLIC PAGE → DO NOTHING
    if (publicRoutes.includes(currentPath)) return;

    //  ONLY REDIRECT IF TOKEN MISSING
    if (!token && currentPath !== "/login") {
      clearAuth();
      navigate("/login", { replace: true });
    }
  };

  const interval = setInterval(checkAuth, 2000); // reduce load
  return () => clearInterval(interval);
}, []);
  const handleLogin = (userData, remember = false, tokenFromApi = null) => {
    persistAuth(userData, tokenFromApi, remember);
    navigate("/");
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600 animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      <Routes>

        <Route
          path="/login"
          element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />}
        />

        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/create-account" element={<CreateAccount />} />

        <Route
          element={
            <ProtectedRoute>
              <Layout user={user} onLogout={handleLogout} transactions={transactions} />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/income" element={<Income />} />
          <Route path="/expense" element={<Expense />} />
          <Route path="/profile" element={
            <Profile
              user={user}
              onUpdateProfile={updateUserData}
              onLogout={handleLogout}
            />
          } />
        </Route>

        <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />

      </Routes>
    </>
  );
};

export default App;