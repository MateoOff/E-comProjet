// src/components/ThemeToggle.jsx
import { Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "../lib/utils";

export const ThemeToggle = ({ className }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialisation : localStorage > préférence système
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    // Applique au montage
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "p-2 rounded-full transition-colors duration-300",
        "hover:bg-gray-200 dark:hover:bg-gray-300",
        "focus:outline-none ",
        "fixed top-4 right-5 z-50 max-sm:hidden",
        className,
      )}
      aria-label={`Passer en mode ${isDarkMode ? "clair" : "sombre"}`}
    >
      {isDarkMode ? (
        <Sun className="h-6 w-6 text-yellow-400" />
      ) : (
        <Moon className="h-6 w-6 text-gray-900 " />
      )}
    </button>
  );
};
