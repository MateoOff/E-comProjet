// src/components/FormProduct.jsx
import { useState } from "react";
import { Button } from "./Button"; // adapte le chemin si besoin
import api from "../lib/api"; // ← IMPORTANT : utilise ton instance axios

export const FormProduct = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState([]); // tableau des URLs ajoutées
  const [currentImageUrl, setCurrentImageUrl] = useState(""); // champ temporaire
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Ajouter l'URL courante au tableau
  const addImage = () => {
    const trimmedUrl = currentImageUrl.trim();
    if (trimmedUrl) {
      // Optionnel : vérification basique d'URL (tu peux améliorer avec regex)
      if (!trimmedUrl.startsWith("http")) {
        setError("L'URL doit commencer par http:// ou https://");
        return;
      }
      setImages([...images, trimmedUrl]);
      setCurrentImageUrl("");
    }
  };

  // Supprimer une URL
  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!title.trim() || !price) {
      setError("Le titre et le prix sont obligatoires");
      setLoading(false);
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError("Le prix doit être un nombre positif");
      setLoading(false);
      return;
    }

    if (images.length === 0) {
      setError("Ajoutez au moins une image");
      setLoading(false);
      return;
    }

    try {
      // Utilisation de api (axios) → refresh token automatique si 401
      const response = await api.post("/products", {
        title: title.trim(),
        description: description.trim() || undefined,
        price: priceNum,
        images, // tableau complet envoyé directement
      });

      alert("Produit ajouté avec succès !");
      setTitle("");
      setDescription("");
      setPrice("");
      setImages([]);
      setCurrentImageUrl("");
    } catch (err) {
      // Erreur gérée par l'interceptor axios + message clair
      setError(
        err.response?.data?.error ||
          err.message ||
          "Une erreur est survenue lors de l'ajout du produit",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Mettre un produit en vente
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Titre */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Titre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Ex: T-shirt coton bio"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Détails du produit, taille, matière, état..."
          />
        </div>

        {/* Prix */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Prix (€) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Ex: 24.99"
          />
        </div>

        {/* Images multiples */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Images du produit <span className="text-red-500">*</span>
          </label>

          {/* Input + bouton Ajouter */}
          <div className="flex gap-2 mb-3">
            <input
              type="url"
              value={currentImageUrl}
              onChange={(e) => setCurrentImageUrl(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="https://exemple.com/image.jpg"
            />
            <Button
              type="button"
              onClick={addImage}
              variant="secondary"
              disabled={!currentImageUrl.trim()}
            >
              Ajouter
            </Button>
          </div>

          {/* Liste des URLs ajoutées */}
          {images.length > 0 ? (
            <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
              {images.map((url, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded-md text-sm group"
                >
                  <span className="truncate flex-1 mr-4 break-all">{url}</span>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium opacity-70 group-hover:opacity-100 transition-opacity"
                  >
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              Ajoutez au moins une image pour continuer
            </p>
          )}
        </div>

        {/* Bouton Soumettre */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full mt-4"
          variant="primary"
        >
          {loading ? "Ajout en cours..." : "Mettre en vente"}
        </Button>
      </form>
    </div>
  );
};
