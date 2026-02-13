import { useState } from "react";
import { Button } from "./Button";

export const FormProduct = ({}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation très basique
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
          image: image.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la création du produit");
      }

      // Succès, on vide le formulaire
      alert("Produit ajouté avec succès !");
      setTitle("");
      setDescription("");
      setPrice("");
      setImage("");
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

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
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

        <div>
          <label className="block text-sm font-medium mb-1">
            URL de l'image
          </label>
          <input
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="https://exemple.com/image.jpg"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full mt-2"
          variant="primary"
        >
          {loading ? "Ajout en cours..." : "Mettre en vente"}
        </Button>
      </form>
    </div>
  );
};
