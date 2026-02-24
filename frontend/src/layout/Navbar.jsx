// src/layout/Navbar.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, LogOut, ShoppingCart, User } from "lucide-react";
import { Button } from "../components/Button";
import { ThemeToggle } from "../components/ThemeToggle";
import { cn } from "../lib/utils";

export const Navbar = ({ isAuthenticated, onLogout, cartItemCount = 0 }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogoutClick = () => {
    onLogout();
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/90 backdrop-blur-md shadow-sm py-3"
          : "bg-transparent py-5"
      }`}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-foreground">
          Mon Shop
        </Link>

        {/* Menu desktop */}
        <div className="hidden md:flex items-center gap-6">
          {isAuthenticated ? (
            <>
              {/* Panier */}
              <Link
                to="/cart"
                className="relative flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <ShoppingCart size={20} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-destructive text-destructive-foreground text-[10px] rounded-full px-1.5 min-w-4.5 h-4.5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
                <span>Panier</span>
              </Link>

              {/* Profil */}
              <Link
                to="/profile"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <User size={20} />
                Profil
              </Link>

              {/* Déconnexion – ici ton Button est parfait car c'est un <button> */}
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogoutClick}
              >
                <LogOut size={16} className="mr-2" />
                Déconnexion
              </Button>
              <ThemeToggle
                className={cn(
                  "fixed right-5 z-50 p-2 rounded-full hover:bg-muted transition-all duration-300 max-sm:hidden",
                  isScrolled ? "top-2" : "top-4", // ajuste selon tes py-3 / py-5
                )}
              />
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Connexion
              </Link>

              {/* Inscription – on utilise un <Link> stylé comme un bouton */}
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-primary-foreground font-medium shadow-lg shadow-blue-600/25 hover:bg-primary/90transition-colors"
              >
                Inscription
              </Link>
            </>
          )}
        </div>

        {/* Bouton menu mobile */}
        <button
          className="md:hidden p-2 text-muted-foreground hover:text-primary"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Menu mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-t">
          <div className="container mx-auto px-4 py-5 flex flex-col gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/cart"
                  className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-muted"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ShoppingCart size={20} />
                  Panier {cartItemCount > 0 && `(${cartItemCount})`}
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-muted"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User size={20} />
                  Profil
                </Link>
                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={handleLogoutClick}
                >
                  <LogOut size={18} className="mr-2" />
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="py-3 px-4 rounded-lg hover:bg-muted"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Connexion
                </Link>

                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-lg shadow-blue-600/25 hover:bg-primary/90 transition-colors w-full text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
