// backend/src/index.js
import express from "express";
import prisma from "../prismaClient.js"; // Ton Prisma Client
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" })); // Remplace par l'URL de ton frontend React

// Middleware d'authentification JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Accès non autorisé" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token invalide" });
    req.user = user;
    next();
  });
};

// Route d'inscription (register)
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe requis" });
  }

  try {
    // Vérifier si l'user existe déjà
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email déjà utilisé" });
    }

    // Hasher le password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Créer l'user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "USER", // Par défaut
      },
    });

    res.status(201).json({ message: "Utilisateur créé", userId: user.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Route de connexion (login)
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe requis" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Identifiants incorrects" });
    }

    // Vérifier le password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Identifiants incorrects" });
    }

    // Générer access token (court, e.g. 15min)
    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );

    // Générer refresh token (long, e.g. 7 jours)
    const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Hasher le refresh token et stocker avec expiration
    const salt = await bcrypt.genSalt(10);
    const refreshTokenHash = await bcrypt.hash(refreshToken, salt);
    const refreshTokenExpiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    ); // 7 jours

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash, refreshTokenExpiresAt },
    });

    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Route pour rafraîchir le token (refresh)
app.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: "Refresh token requis" });
  }

  try {
    // Vérifier le refresh token (valide et non expiré)
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    if (!user || !user.refreshTokenHash || !user.refreshTokenExpiresAt) {
      return res.status(401).json({ error: "Refresh token invalide" });
    }

    // Vérifier l'expiration
    if (new Date() > user.refreshTokenExpiresAt) {
      return res.status(401).json({ error: "Refresh token expiré" });
    }

    // Comparer le hash
    const isMatch = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Refresh token invalide" });
    }

    // Générer un nouveau access token
    const newAccessToken = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: "Refresh token invalide" });
  }
});

app.post("/products", authenticateToken, async (req, res) => {
  const { title, description, price, images = [] } = req.body; // ← accepte "images" (tableau)

  // Validation de base
  if (!title || !price) {
    return res.status(400).json({ error: "Titre et prix sont obligatoires" });
  }

  if (typeof price !== "number" || price <= 0) {
    return res
      .status(400)
      .json({ error: "Le prix doit être un nombre positif" });
  }

  // Validation images (doit être un tableau)
  if (!Array.isArray(images)) {
    return res
      .status(400)
      .json({ error: "Le champ 'images' doit être un tableau d'URLs" });
  }

  // Nettoyage : garde seulement les URLs valides
  const validImages = images
    .filter((url) => typeof url === "string" && url.trim().length > 0)
    .map((url) => url.trim());

  try {
    const userId = req.user.userId;

    const newProduct = await prisma.product.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        price,
        images: validImages, // ← le bon champ !
        ownerId: userId,
      },
    });

    res.status(201).json({
      message: "Produit créé avec succès",
      product: newProduct,
    });
  } catch (error) {
    console.error("Erreur création produit :", error);
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Conflit de données" });
    }
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la création du produit" });
  }
});
// Route publique : Lister TOUS les produits (pour la page boutique)
app.get("/products", async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      // Tri : les plus récents en premier
      orderBy: {
        createdAt: "desc",
      },
      // Inclure l'ID du propriétaire (pas d'email ou autres infos sensibles)
      include: {
        owner: {
          select: {
            id: true,
          },
        },
      },
      // Pas de select() ici → on renvoie TOUS les champs du produit (title, price, images, etc.)
    });
    res.json(products);
  } catch (error) {
    console.error("Erreur lors de la récupération des produits :", error);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la récupération des produits" });
  }
});

// Détail d'un produit (publique)
app.get("/products/:id", async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        owner: {
          select: { id: true }, // ou plus si tu veux afficher le nom du vendeur
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Produit non trouvé" });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
