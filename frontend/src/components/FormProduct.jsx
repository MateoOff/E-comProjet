import { useState } from "react";
import { Button } from "./Button"; // adapte le chemin si besoin

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
    if (currentImageUrl.trim()) {
      setImages([...images, currentImageUrl.trim()]);
      setCurrentImageUrl(""); // reset l'input
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
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Vous devez être connecté pour ajouter un produit");
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          price: priceNum,
          images, // ← le tableau complet
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la création du produit");
      }

      alert("Produit ajouté avec succès !");
      setTitle("");
      setDescription("");
      setPrice("");
      setImages([]);
      setCurrentImageUrl("");
    } catch (err) {
      setError(err.message || "Une erreur est survenue");
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
            rows={3}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Détails du produit..."
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

          {images.length > 0 && (
            <div className="space-y-2 mb-4">
              {images.map((url, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded-md text-sm"
                >
                  <span className="truncate flex-1 mr-4">{url}</span>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
                  >
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
          )}

          {images.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              Ajoutez au moins une image
            </p>
          )}
        </div>

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
