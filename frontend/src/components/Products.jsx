// src/pages/Products.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api"; // ton axios

export const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");
        setProducts(response.data); // ← ICI : .data contient le tableau
      } catch (err) {
        console.error("Erreur fetch products:", err);
        setError(
          err.response?.data?.error ||
            err.message ||
            "Impossible de charger les produits",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Chargement des produits...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-xl text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!Array.isArray(products) || products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">
          Aucun produit disponible pour le moment
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Revenez bientôt ou connectez-vous pour en ajouter !
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-10">Nos produits</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col"
          >
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/400x300?text=Image+non+disponible";
                }}
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-gray-500 dark:text-gray-400">
                  Pas d'image
                </span>
              </div>
            )}

            <div className="p-5 flex flex-col grow">
              <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                {product.title}
              </h3>

              {product.description && (
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 grow">
                  {product.description}
                </p>
              )}

              <div className="mt-auto">
                <p className="text-xl font-bold text-green-600 dark:text-green-400 mb-4">
                  {product.price.toFixed(2)} €
                </p>

                <Link
                  to={`/product/${product.id}`}
                  className="block w-full text-center py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Voir le produit
                </Link>

                <button className="mt-3 w-full py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-700/70">
                  Ajouter au panier
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
