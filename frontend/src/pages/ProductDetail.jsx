// src/pages/ProductDetail.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../lib/api"; // ← ton axios avec interceptors

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data); // ← ICI : response.data contient le produit
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
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-xl">Chargement du produit...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Erreur</h2>
        <p>{error || "Produit introuvable"}</p>
        <Link
          to="/products"
          className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retour à la boutique
        </Link>
      </div>
    );
  }

  const mainImage = product.images?.[selectedImageIndex] || null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* === ZONE IMAGES === */}
        <div className="flex flex-col gap-6">
          {/* Image principale */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg">
            {mainImage ? (
              <img
                src={mainImage}
                alt={`${product.title} - vue principale`}
                className="w-full h-auto max-h-[500px] object-contain mx-auto transition-transform duration-300 hover:scale-105"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/600x600?text=Image+non+disponible";
                }}
              />
            ) : (
              <div className="w-full aspect-square flex items-center justify-center text-gray-500 dark:text-gray-400">
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
                  className={`flex-shrink-0 snap-start rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    selectedImageIndex === idx
                      ? "border-blue-500 scale-105 shadow-md"
                      : "border-transparent hover:border-blue-300 opacity-80 hover:opacity-100"
                  }`}
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
          <h1 className="text-3xl font-bold mb-4">{product.title}</h1>

          <p className="text-4xl font-bold text-green-600 dark:text-green-400 mb-6">
            {product.price?.toFixed(2) ?? "—"} €{" "}
            {/* ← protection si price undefined */}
          </p>

          {product.description ? (
            <div className="prose dark:prose-invert max-w-none mb-8">
              <p className="text-lg leading-relaxed">{product.description}</p>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 mb-8 italic">
              Aucune description disponible
            </p>
          )}

          <div className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Mis en vente le{" "}
            {new Date(product.createdAt).toLocaleDateString("fr-FR")}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-auto">
            <button className="flex-1 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition text-lg">
              Ajouter au panier
            </button>

            <Link
              to="/products"
              className="flex-1 py-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition text-center text-lg"
            >
              Retour à la boutique
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
