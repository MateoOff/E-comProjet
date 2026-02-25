// src/pages/ProductDetail.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../lib/api";
import { cn } from "../lib/utils";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addToCartLoading, setAddToCartLoading] = useState(false);
  const [addToCartSuccess, setAddToCartSuccess] = useState(false);

  const handleAddToCart = async () => {
    setAddToCartLoading(true);
    setAddToCartSuccess(false);
    setError(null);

    try {
      await api.post("/cart/items", {
        productId: id,
        quantity: 1,
      });
      setAddToCartSuccess(true);
      setTimeout(() => setAddToCartSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'ajout au panier");
    } finally {
      setAddToCartLoading(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        setError(
          err.response?.data?.error ||
            err.message ||
            "Erreur lors du chargement du produit",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        Chargement du produit...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-destructive mb-4">Erreur</h2>
        <p className="text-foreground">{error || "Produit introuvable"}</p>
        <Link
          to="/products"
          className="mt-6 inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Retour à la boutique
        </Link>
      </div>
    );
  }

  const mainImage = product.images?.[selectedImageIndex] || null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl bg-background text-foreground">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* ZONE IMAGES */}
        <div className="flex flex-col gap-6">
          {/* Image principale */}
          <div className="bg-card rounded-xl overflow-hidden shadow-lg border border-border">
            {mainImage ? (
              <img
                src={mainImage}
                alt={`${product.title} - vue principale`}
                className="w-full h-auto max-h-125 object-contain mx-auto transition-transform duration-300 hover:scale-105"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/600x600?text=Image+non+disponible";
                }}
              />
            ) : (
              <div className="w-full aspect-square flex items-center justify-center text-muted-foreground bg-muted">
                Aucune image disponible
              </div>
            )}
          </div>

          {/* Galerie de miniatures */}
          {product.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={cn(
                    "shrink-0 snap-start rounded-lg overflow-hidden border-2 transition-all duration-200",
                    selectedImageIndex === idx
                      ? "border-primary scale-105 shadow-md"
                      : "border-transparent hover:border-primary/50 opacity-80 hover:opacity-100",
                  )}
                >
                  <img
                    src={img}
                    alt={`${product.title} - vue ${idx + 1}`}
                    className="w-20 h-20 object-cover"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/80?text=?";
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Infos produit */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold mb-4 text-foreground">
            {product.title}
          </h1>

          <p className="text-4xl font-bold text-primary mb-6">
            {product.price?.toFixed(2) ?? "—"} €
          </p>

          {product.description ? (
            <div className="prose max-w-none mb-8 text-foreground">
              <p className="text-lg leading-relaxed">{product.description}</p>
            </div>
          ) : (
            <p className="text-muted-foreground mb-8 italic">
              Aucune description disponible
            </p>
          )}

          <div className="text-sm text-muted-foreground mb-8">
            Mis en vente le{" "}
            {new Date(product.createdAt).toLocaleDateString("fr-FR")}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-auto">
            <button
              onClick={handleAddToCart}
              disabled={addToCartLoading}
              className={cn(
                "flex-1 py-4 font-semibold rounded-lg transition text-lg",
                addToCartLoading
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              {addToCartLoading
                ? "Ajout en cours..."
                : addToCartSuccess
                  ? "Ajouté ! ✓"
                  : "Ajouter au panier"}
            </button>

            <Link
              to="/products"
              className="flex-1 py-4 bg-muted text-foreground font-semibold rounded-lg hover:bg-muted/80 transition text-center text-lg"
            >
              Retour à la boutique
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
