import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { cn } from "../lib/utils";

export const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartStatus, setCartStatus] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");
        setProducts(response.data);
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

  const handleAddToCart = async (productId) => {
    setCartStatus((prev) => ({
      ...prev,
      [productId]: { loading: true, success: false },
    }));

    try {
      await api.post("/cart/items", {
        productId,
        quantity: 1,
      });

      setCartStatus((prev) => ({
        ...prev,
        [productId]: { loading: false, success: true },
      }));

      setTimeout(() => {
        setCartStatus((prev) => ({
          ...prev,
          [productId]: { loading: false, success: false },
        }));
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'ajout au panier");
      setCartStatus((prev) => ({
        ...prev,
        [productId]: { loading: false, success: false },
      }));
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
        Chargement des produits...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-xl text-destructive">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!Array.isArray(products) || products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          Aucun produit disponible pour le moment
        </h2>
        <p className="text-muted-foreground mb-8">
          Revenez bientôt ou connectez-vous pour en ajouter !
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-10 text-foreground">
        Nos produits
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {products.map((product) => {
          const status = cartStatus[product.id] || {
            loading: false,
            success: false,
          };

          return (
            <div
              key={product.id}
              className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col border border-border"
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
                <div className="w-full h-48 bg-muted flex items-center justify-center text-muted-foreground">
                  Pas d'image
                </div>
              )}

              <div className="p-5 flex flex-col grow">
                <h3 className="text-lg font-semibold mb-2 line-clamp-2 text-foreground">
                  {product.title}
                </h3>

                {product.description && (
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3 grow">
                    {product.description}
                  </p>
                )}

                <div className="mt-auto">
                  <p className="text-xl font-bold text-primary mb-4">
                    {product.price.toFixed(2)} €
                  </p>

                  <Link
                    to={`/product/${product.id}`}
                    className="block w-full text-center py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Voir le produit
                  </Link>

                  <button
                    className={cn(
                      "mt-3 w-full py-2 rounded-lg transition-colors",
                      status.loading
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : status.success
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80 text-foreground",
                    )}
                    onClick={() => handleAddToCart(product.id)}
                    disabled={status.loading}
                  >
                    {status.loading
                      ? "Ajout en cours..."
                      : status.success
                        ? "Ajouté ! ✓"
                        : "Ajouter au panier"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
