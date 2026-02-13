import { Button } from "../components/Button";
import { useNavigate } from "react-router-dom";
import { Products } from "./../components/Products";

// src/pages/Home.jsx
export default function Home({ isAuthenticated }) {
  const navigate = useNavigate();

  const handleSellClick = () => {
    if (isAuthenticated) {
      navigate("/sell");
    } else {
      navigate("/login");
    }
  };
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">
        Bienvenue sur Mon Shop !
      </h1>
      {!isAuthenticated && (
        <p className="text-xl text-center text-gray-600">
          Découvrez nos produits – Connectez-vous pour ajouter au panier ou
          vendre des produits.
        </p>
      )}
      {isAuthenticated && (
        <p className="text-xl text-center text-gray-600">
          Découvrez nos produits
        </p>
      )}
      {isAuthenticated && (
        <Button
          className="mt-2"
          size="default"
          variant="primary"
          onClick={handleSellClick}
        >
          {isAuthenticated ? "Vendre un produit" : "Commencer à vendre"}
        </Button>
      )}
      <Products />
    </div>
  );
}
