// src/pages/Profile.jsx
import { useState, useEffect } from "react";
import api from "../lib/api";
import { Button } from "../components/Button";
import { Edit, Save } from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/me");

        const profileData = response.data;

        setUser(profileData);
        setFormData({
          username: profileData.username || "",
          email: profileData.email || "",
          password: "",
        });
      } catch (err) {
        console.error("Erreur fetch profil :", err);
        setError(
          err.response?.data?.error ||
            err.message ||
            "Impossible de charger le profil",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const updatePayload = {};
      if (formData.username && formData.username !== user.username) {
        updatePayload.username = formData.username.trim();
      }
      if (formData.email && formData.email !== user.email) {
        updatePayload.email = formData.email.trim();
      }
      if (formData.password.trim()) {
        updatePayload.password = formData.password.trim();
      }

      if (Object.keys(updatePayload).length === 0) {
        setEditMode(false);
        return;
      }

      const response = await api.patch("/me", updatePayload);
      const updatedUser = response.data.user;
      setUser(updatedUser);
      setEditMode(false);
      setFormData({ ...formData, password: "" });
      alert("Profil mis à jour avec succès !");
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de la mise à jour");
    }
  };

  if (loading)
    return <div className="text-center py-20">Chargement du profil...</div>;
  if (error)
    return <div className="text-center py-20 text-red-600">{error}</div>;
  if (!user) return <div className="text-center py-20">Profil introuvable</div>;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-10">Mon Profil</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        {/* Infos personnelles */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">
              Informations personnelles
            </h2>
            <Button
              variant={editMode ? "destructive" : "primary"}
              size="sm"
              onClick={() => {
                if (editMode) handleSave();
                setEditMode(!editMode);
              }}
            >
              {editMode ? (
                <>
                  <Save size={16} className="mr-2" /> Enregistrer
                </>
              ) : (
                <>
                  <Edit size={16} className="mr-2" /> Modifier
                </>
              )}
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Nom d'utilisateur
              </label>
              {editMode ? (
                <input
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Choisissez un nom unique"
                />
              ) : (
                <p className="text-lg font-medium">
                  {user.username || "Non défini"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              {editMode ? (
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              ) : (
                <p className="text-lg">{user.email || "Non défini"}</p>
              )}
            </div>

            {editMode && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nouveau mot de passe (optionnel)
                </label>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Laissez vide pour ne pas changer"
                  className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">
                Inscrit le
              </label>
              <p className="text-lg">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "Date non disponible"}
              </p>
            </div>
          </div>
        </div>

        {/* Mes produits */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Mes produits en vente</h2>

          {user.products?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {user.products.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow hover:shadow-md transition"
                >
                  {prod.images?.[0] && (
                    <img
                      src={prod.images[0]}
                      alt={prod.title}
                      className="w-full h-40 object-cover rounded mb-3"
                    />
                  )}
                  <h3 className="font-medium text-lg">{prod.title}</h3>
                  <p className="text-green-600 font-bold mt-1">
                    {prod.price.toFixed(2)} €
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                    {prod.description || "Pas de description"}
                  </p>
                  <div className="mt-4">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async () => {
                        if (
                          !confirm(
                            "Retirer ce produit de la vente ? Cette action est irréversible.",
                          )
                        )
                          return;

                        try {
                          await api.delete(`/products/${prod.id}`);
                          // Recharge les données du profil après suppression
                          const refreshed = await api.get("/me");
                          setUser(refreshed.data);
                          alert("Produit retiré avec succès");
                        } catch (err) {
                          alert(
                            "Erreur lors de la suppression : " +
                              (err.response?.data?.error || err.message),
                          );
                        }
                      }}
                    >
                      Retirer de la vente
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic">
              Vous n'avez pas encore mis de produits en vente.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
