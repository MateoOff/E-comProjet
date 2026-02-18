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
  const { email, password, username } = req.body;

  // Validation
  if (!email || !password || !username) {
    return res
      .status(400)
      .json({ error: "Email, mot de passe et nom d'utilisateur sont requis" });
  }

  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({
      error: "Le nom d'utilisateur doit faire entre 3 et 20 caractères",
    });
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({
      error: "Le nom d'utilisateur ne peut contenir que lettres, chiffres et _",
    });
  }

  try {
    // Vérifier si l'email existe déjà
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ error: "Email déjà utilisé" });
    }

    // Vérifier si le username existe déjà
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUsername) {
      return res.status(409).json({ error: "Nom d'utilisateur déjà pris" });
    }

    // Hasher le password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        username, // ← AJOUTÉ
        password: hashedPassword,
        role: "USER",
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

// POST /cart/items - Ajouter un produit au panier (ou incrémenter quantité)
app.post("/cart/items", authenticateToken, async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const userId = req.user.userId;

  if (!productId) return res.status(400).json({ error: "productId requis" });
  if (!Number.isInteger(quantity) || quantity < 1) {
    return res
      .status(400)
      .json({ error: "Quantité doit être un entier positif" });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) return res.status(404).json({ error: "Produit non trouvé" });

    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: { increment: quantity } },
      });
      return res.json({ message: "Quantité mise à jour" });
    }

    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
    });

    res.status(201).json({ message: "Produit ajouté au panier" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /cart - Récupérer le panier complet
app.get("/cart", authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                price: true,
                images: true,
                description: true,
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.json({ items: [], totalItems: 0, totalPrice: 0 });
    }

    const totalItems = cart.items.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = cart.items.reduce(
      (sum, i) => sum + i.quantity * i.product.price,
      0,
    );

    res.json({
      items: cart.items.map((item) => ({
        id: item.id,
        product: item.product,
        quantity: item.quantity,
        subtotal: item.quantity * item.product.price,
      })),
      totalItems,
      totalPrice: totalPrice.toFixed(2),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Bonus : DELETE /cart/items/:itemId - Supprimer un item
app.delete("/cart/items/:itemId", authenticateToken, async (req, res) => {
  const { itemId } = req.params;
  const userId = req.user.userId;

  try {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      return res.status(404).json({ error: "Item non trouvé ou non autorisé" });
    }

    await prisma.cartItem.delete({ where: { id: itemId } });

    res.json({ message: "Produit supprimé du panier" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// PATCH /cart/items/:itemId - Modifier la quantité d'un item
app.patch("/cart/items/:itemId", authenticateToken, async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;
  const userId = req.user.userId;

  if (!Number.isInteger(quantity) || quantity < 1) {
    return res
      .status(400)
      .json({ error: "Quantité doit être un entier positif" });
  }

  try {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      return res.status(404).json({ error: "Item non trouvé ou non autorisé" });
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: {
        product: {
          select: { price: true },
        },
      },
    });

    res.json({
      message: "Quantité mise à jour",
      item: {
        id: updatedItem.id,
        quantity: updatedItem.quantity,
        subtotal: updatedItem.quantity * updatedItem.product.price,
      },
    });
  } catch (error) {
    console.error("Erreur mise à jour quantité :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /me - Récupère les infos de l'utilisateur connecté + ses produits
app.get("/me", authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        // Pas de password ni tokens
        products: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            stock: true,
            images: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.json(user);
  } catch (error) {
    console.error("Erreur /me :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// PATCH /me
app.patch("/me", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { username, email, password } = req.body;

  try {
    if (!username && !email && !password) {
      return res.status(400).json({ error: "Aucun champ à modifier" });
    }

    const updateData = {};

    if (username) {
      const existing = await prisma.user.findUnique({ where: { username } });
      if (existing && existing.id !== userId) {
        return res
          .status(409)
          .json({ error: "Nom d'utilisateur déjà utilisé" });
      }
      updateData.username = username.trim();
    }

    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== userId) {
        return res.status(409).json({ error: "Email déjà utilisé" });
      }
      updateData.email = email.trim();
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        products: {
          // ← AJOUTE ÇA pour renvoyer aussi les produits
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            images: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    res.json({ message: "Profil mis à jour", user: updatedUser });
  } catch (error) {
    console.error("Erreur mise à jour profil :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.delete("/products/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({ error: "Produit non trouvé" });
    }

    if (product.ownerId !== userId) {
      return res
        .status(403)
        .json({ error: "Vous n'êtes pas le propriétaire de ce produit" });
    }

    await prisma.product.delete({
      where: { id },
    });

    res.json({ message: "Produit supprimé avec succès" });
  } catch (error) {
    console.error("Erreur suppression produit :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
