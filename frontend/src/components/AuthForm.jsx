// src/components/AuthForm.jsx
import { useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function AuthForm({ type, onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const endpoint = type === "login" ? "/login" : "/register";
      const payload = { email, password };

      const res = await axios.post(`${API}${endpoint}`, payload);

      if (type === "register") {
        setMessage("Compte créé ! Vous pouvez maintenant vous connecter.");
      } else {
        // Login → on stocke les tokens (simple pour test)
        localStorage.setItem("accessToken", res.data.accessToken);
        localStorage.setItem("refreshToken", res.data.refreshToken);
        setMessage("Connexion réussie ! Tokens stockés.");
        if (onSuccess) onSuccess(); // ex: rediriger
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || "Erreur inattendue";
      setError(errMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-16 p-8 bg-white rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
        {type === "login" ? "Connexion" : "Inscription"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder="exemple@domaine.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 font-semibold rounded-lg text-white transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
          }`}
        >
          {loading
            ? "Chargement..."
            : type === "login"
              ? "Se connecter"
              : "S'inscrire"}
        </button>
      </form>

      {message && (
        <p className="mt-6 text-center text-green-600 font-medium">{message}</p>
      )}
      {error && (
        <p className="mt-6 text-center text-red-600 font-medium">{error}</p>
      )}

      <p className="mt-8 text-center text-sm text-gray-600">
        {type === "login" ? (
          <>
            Pas de compte ?{" "}
            <a
              href="/register"
              className="text-blue-600 hover:underline font-medium"
            >
              Créer un compte
            </a>
          </>
        ) : (
          <>
            Déjà inscrit ?{" "}
            <a
              href="/login"
              className="text-blue-600 hover:underline font-medium"
            >
              Se connecter
            </a>
          </>
        )}
      </p>
    </div>
  );
}
