// src/hooks/useInactivityLogout.js
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export const useInactivityLogout = (isAuthenticated) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId;

    const logout = () => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate("/login", { replace: true });
    };

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(logout, INACTIVITY_TIMEOUT);
    };

    const events = ["mousemove", "keydown", "scroll", "click", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [isAuthenticated, navigate]);
};
