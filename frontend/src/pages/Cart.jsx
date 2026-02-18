// src/pages/Cart.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { Plus, Minus, Trash2 } from "lucide-react"; // ← ajoute ces icônes

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
    if (newQuantity < 1) return; // empêche quantité < 1

    try {
      const response = await api.patch(`/cart/items/${itemId}`, {
        quantity: newQuantity,
      });

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

  if (loading)
    return <div className="text-center py-20">Chargement du panier...</div>;
  if (error)
    return <div className="text-center py-20 text-red-600">{error}</div>;

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Votre panier est vide</h2>
        <Link to="/products" className="text-blue-600 hover:underline">
          Continuer vos achats
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Mon Panier</h1>

      <div className="space-y-6">
        {cart.items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row items-center gap-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
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
              <h3 className="text-xl font-semibold">
                {item.product?.title || "Produit inconnu"}
              </h3>
              <p className="text-green-600 font-bold mt-1">
                {item.product?.price?.toFixed(2) ?? "—"} € × {item.quantity}
              </p>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Sous-total : {item.subtotal?.toFixed(2) ?? "—"} €
              </p>
            </div>

            {/* Contrôles quantité + supprimer */}
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded border-gray-300 dark:border-gray-600 ">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="px-3 py-2 hover:bg-gray-100 rounded dark:hover:bg-gray-700"
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 py-2 font-medium">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="px-3 py-2 hover:bg-gray-100 rounded dark:hover:bg-gray-700"
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                onClick={() => removeItem(item.id)}
                className="p-3 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Total et payer */}
      <div className="mt-12 bg-gray-100 dark:bg-gray-800 p-8 rounded-xl text-center">
        <div className="text-2xl font-bold mb-4">
          Total ({cart.totalItems} article{cart.totalItems !== 1 ? "s" : ""}) :{" "}
          {cart.totalPrice} €
        </div>

        <button
          disabled
          className="w-full max-w-md py-4 bg-blue-600/50 text-white/50 font-semibold rounded-lg cursor-not-allowed"
        >
          Payer le panier (bientôt disponible)
        </button>

        <p className="mt-4 text-sm text-gray-500">
          Fonctionnalité de paiement en cours de développement
        </p>
      </div>
    </div>
  );
}
