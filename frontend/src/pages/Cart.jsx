// src/pages/Cart.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { Plus, Minus, Trash2 } from "lucide-react";

export default function Cart() {
  const [cart, setCart] = useState({
    items: [],
    totalItems: 0,
    totalPrice: "0.00",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await api.get("/cart");
        const data = response.data || {};
        setCart({
          items: Array.isArray(data.items) ? data.items : [],
          totalItems: data.totalItems || 0,
          totalPrice: data.totalPrice || "0.00",
        });
      } catch (err) {
        setError(
          err.response?.data?.error || "Impossible de charger le panier",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await api.patch(`/cart/items/${itemId}`, { quantity: newQuantity });

      setCart((prev) => {
        const updatedItems = prev.items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                quantity: newQuantity,
                subtotal: newQuantity * item.product.price,
              }
            : item,
        );

        const newTotalItems = updatedItems.reduce(
          (sum, i) => sum + i.quantity,
          0,
        );
        const newTotalPrice = updatedItems
          .reduce((sum, i) => sum + i.subtotal, 0)
          .toFixed(2);

        return {
          ...prev,
          items: updatedItems,
          totalItems: newTotalItems,
          totalPrice: newTotalPrice,
        };
      });
    } catch (err) {
      setError("Erreur lors de la mise à jour de la quantité");
    }
  };

  const removeItem = async (itemId) => {
    if (!confirm("Supprimer cet article ?")) return;

    try {
      await api.delete(`/cart/items/${itemId}`);

      setCart((prev) => {
        const removedItem = prev.items.find((i) => i.id === itemId);
        const removedSubtotal = removedItem ? removedItem.subtotal : 0;
        const newItems = prev.items.filter((i) => i.id !== itemId);

        return {
          ...prev,
          items: newItems,
          totalItems: prev.totalItems - (removedItem?.quantity || 0),
          totalPrice: (Number(prev.totalPrice) - removedSubtotal).toFixed(2),
        };
      });
    } catch (err) {
      setError("Erreur lors de la suppression");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Chargement du panier...
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-20 text-destructive">{error}</div>;
  }

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center bg-background text-foreground">
        <h2 className="text-2xl font-bold mb-4 text-foreground">
          Votre panier est vide
        </h2>
        <Link
          to="/products"
          className="text-primary hover:text-primary/80 transition-colors"
        >
          Continuer vos achats
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl bg-background text-foreground">
      <h1 className="text-3xl font-bold mb-8 text-center text-foreground">
        Mon Panier
      </h1>

      {/* Card principale qui englobe TOUT */}
      <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
        {/* Liste des articles */}
        <div className="p-6 space-y-6">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row items-center gap-6 bg-subcard p-5 rounded-lg border border-border-subcard hover:bg-subcard/90 transition"
            >
              {/* Image */}
              <img
                src={
                  item.product?.images?.[0] || "https://via.placeholder.com/120"
                }
                alt={item.product?.title || "Produit"}
                className="w-32 h-32 object-cover rounded"
              />

              {/* Infos */}
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-foreground">
                  {item.product?.title || "Produit inconnu"}
                </h3>
                <p className="text-primary font-bold mt-1">
                  {item.product?.price?.toFixed(2) ?? "—"} € × {item.quantity}
                </p>
                <p className="text-muted-foreground mt-2">
                  Sous-total : {item.subtotal?.toFixed(2) ?? "—"} €
                </p>
              </div>

              {/* Contrôles quantité + supprimer */}
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="px-3 py-2 hover:bg-muted disabled:opacity-50 text-foreground"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4 py-2 font-medium text-foreground">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-3 py-2 hover:bg-muted text-foreground"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="p-3 text-destructive hover:text-destructive/80 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Séparateur visuel subtil */}
        <div className="border-t border-border mx-6"></div>

        {/* Total et payer (dans la même card principale) */}
        <div className="p-8 text-center">
          <div className="text-2xl font-bold mb-6 text-foreground">
            Total ({cart.totalItems} article{cart.totalItems !== 1 ? "s" : ""})
            : {cart.totalPrice} €
          </div>

          <button
            disabled
            className="w-full max-w-md py-4 bg-primary/70 text-primary-foreground/70 font-semibold rounded-lg cursor-not-allowed mb-4"
          >
            Payer le panier (bientôt disponible)
          </button>

          <p className="text-sm text-muted-foreground">
            Fonctionnalité de paiement en cours de développement
          </p>
        </div>
      </div>
    </div>
  );
}
