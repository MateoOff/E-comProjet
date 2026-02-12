// src/App.jsx
import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { Navbar } from "./layout/Navbar"; // adapte le chemin selon ton projet
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
// import Dashboard from "./pages/Dashboard"; // décommente quand tu l'auras créée

function ProtectedRoute({ children }) {
  const isAuthenticated = !!localStorage.getItem("accessToken");
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirige vers login + garde en mémoire la page demandée
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("accessToken"),
  );

  // Optionnel : écoute les changements de storage (multi-onglets)
  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem("accessToken"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsAuthenticated(false);
    // Optionnel : navigate("/login") si tu utilises useNavigate ici
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        {/* Navbar principale – toujours visible */}
        <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />

        <main className="pt-20">
          {" "}
          {/* espace pour la navbar fixed */}
          <Routes>
            {/* Pages publiques */}
            <Route path="/" element={<Home />} />
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

            {/* Pages protégées – exemple */}
            {/* <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            /> */}

            {/* Catch-all → redirection vers accueil */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
