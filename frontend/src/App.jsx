// src/App.jsx
import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { Navbar } from "./layout/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SellProduct from "./pages/SellProduct";
import ProductDetail from "./pages/ProductDetail";
import { useInactivityLogout } from "./hooks/useInactivityLogout"; // ton hook corrigé

function ProtectedRoute({ children }) {
  const isAuthenticated = !!localStorage.getItem("accessToken");
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("accessToken"),
  );

  // Synchronisation de l'état auth (multi-onglets + refresh)
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("accessToken");
      setIsAuthenticated(!!token);
    };

    checkAuth();

    window.addEventListener("storage", checkAuth);

    // Écoute la déconnexion forcée (ex: refresh token échoué)
    const handleForcedLogout = () => {
      setIsAuthenticated(false);
      navigate("/login", { replace: true });
    };
    window.addEventListener("auth:forced-logout", handleForcedLogout);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("auth:forced-logout", handleForcedLogout);
    };
  }, [navigate]);

  // Déconnexion sur inactivité (30 min)
  useInactivityLogout(isAuthenticated);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsAuthenticated(false);
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />

      <main className="pt-20">
        <Routes>
          <Route
            path="/"
            element={<Home isAuthenticated={isAuthenticated} />}
          />
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <Login setIsAuthenticated={setIsAuthenticated} />
              )
            }
          />
          <Route
            path="/register"
            element={
              isAuthenticated ? <Navigate to="/" replace /> : <Register />
            }
          />
          <Route
            path="/sell"
            element={
              <ProtectedRoute>
                <SellProduct />
              </ProtectedRoute>
            }
          />
          <Route path="/product/:id" element={<ProductDetail />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
