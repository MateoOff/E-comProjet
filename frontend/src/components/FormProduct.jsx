// src/components/FormProduct.jsx
import { useState } from "react";
import { Button } from "./Button";
import api from "../lib/api";

export const FormProduct = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("1");
  const [images, setImages] = useState([]);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const addImage = () => {
    const trimmedUrl = currentImageUrl.trim();
    if (trimmedUrl) {
      if (!trimmedUrl.startsWith("http")) {
        setError("L'URL doit commencer par http:// ou https://");
        return;
      }
      setImages([...images, trimmedUrl]);
      setCurrentImageUrl("");
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!title.trim() || !price || !stock) {
      setError("Le titre, le prix et le stock sont obligatoires");
      setLoading(false);
      return;
    }

    const priceNum = parseFloat(price);
    const stockNum = parseInt(stock, 10);

    if (isNaN(priceNum) || priceNum <= 0) {
      setError("Le prix doit être un nombre positif");
      setLoading(false);
      return;
    }

    if (isNaN(stockNum) || stockNum < 1) {
      setError("Le stock doit être un entier positif");
      setLoading(false);
      return;
    }

    if (images.length === 0) {
      setError("Ajoutez au moins une image");
      setLoading(false);
      return;
    }

    try {
      await api.post("/products", {
        title: title.trim(),
        description: description.trim() || undefined,
        price: priceNum,
        stock: stockNum,
        images,
      });

      alert("Produit ajouté avec succès !");
      setTitle("");
      setDescription("");
      setPrice("");
      setStock("1");
      setImages([]);
      setCurrentImageUrl("");
    } catch (err) {
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
    <div className="max-w-lg mx-auto p-6 bg-card rounded-lg shadow-md border border-border">
      <h2 className="text-2xl font-bold mb-6 text-center text-foreground">
        Mettre un produit en vente
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Titre */}
        <div>
          <label className="block text-sm font-medium mb-1 text-muted-foreground">
            Titre <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Ex: T-shirt coton bio"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1 text-muted-foreground">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Détails du produit, taille, matière, état..."
          />
        </div>

        {/* Prix */}
        <div>
          <label className="block text-sm font-medium mb-1 text-muted-foreground">
            Prix (€) <span className="text-destructive">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Ex: 24.99"
          />
        </div>

        {/* Stock */}
        <div>
          <label className="block text-sm font-medium mb-1 text-muted-foreground">
            Stock disponible <span className="text-destructive">*</span>
          </label>
          <input
            type="number"
            min="1"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
            className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Ex: 10 (unités disponibles)"
          />
        </div>

        {/* Images multiples */}
        <div>
          <label className="block text-sm font-medium mb-2 text-muted-foreground">
            Images du produit <span className="text-destructive">*</span>
          </label>

          <div className="flex gap-2 mb-3">
            <input
              type="url"
              value={currentImageUrl}
              onChange={(e) => setCurrentImageUrl(e.target.value)}
              className="flex-1 px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://exemple.com/image.jpg"
            />
            <Button
              type="button"
              onClick={addImage}
              variant="primary"
              disabled={!currentImageUrl.trim()}
            >
              Ajouter
            </Button>
          </div>

          {images.length > 0 ? (
            <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
              {images.map((url, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-muted p-3 rounded-md text-sm border border-border"
                >
                  <span className="truncate flex-1 mr-4 break-all text-foreground">
                    {url}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="text-destructive hover:text-destructive/80 font-medium transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
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
