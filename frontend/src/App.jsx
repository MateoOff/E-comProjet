// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Mini navbar pour tester */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="text-xl font-bold text-gray-800">
              E-commerce Test
            </div>
            <div className="space-x-6">
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Connexion
              </Link>
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Inscription
              </Link>
            </div>
          </div>
        </nav>

        <Routes>
          <Route
            path="/"
            element={
              <div className="text-center py-20 text-2xl">
                Bienvenue ! → /login ou /register
              </div>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
