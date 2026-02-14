// src/lib/api.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor REQUEST : ajoute automatiquement le token s'il existe
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor RESPONSE : gestion refresh token + logout automatique
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si 401 ou 403 ET ce n'est pas déjà une tentative de refresh
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("Aucun refresh token disponible");
        }

        // Appel à /refresh (ton endpoint existant)
        const { data } = await axios.post(`${API_URL}/refresh`, {
          refreshToken,
        });

        // Mise à jour des tokens
        localStorage.setItem("accessToken", data.accessToken);
        // Si ton refresh renvoie un nouveau refreshToken (rotation), décommente :
        // if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);

        // Mise à jour du header de la requête originale
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        // Relance la requête originale avec le nouveau token
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Échec du refresh token :", refreshError);

        // Logout forcé
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        // Redirection (window.location pour être sûr, même hors React Router)
        window.location.href = "/login?session_expired=true";

        return Promise.reject(refreshError);
      }
    }

    // Autres erreurs passent normalement
    return Promise.reject(error);
  },
);

// Utilitaire pour définir/supprimer le token manuellement (après login par ex.)
export const setAuthToken = (accessToken) => {
  if (accessToken) {
    localStorage.setItem("accessToken", accessToken);
  } else {
    localStorage.removeItem("accessToken");
  }
};

export default api;
