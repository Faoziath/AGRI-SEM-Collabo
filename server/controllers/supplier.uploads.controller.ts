import path from "path";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const BASE_URL = process.env.BASE_URL || "http://localhost:8000";

export const uploadProductImage = async (req, res) => {
  try {
    const supplierId = req.userId;
    const productId = Number(req.params.id);
    const file = req.file;

    if (!file) return res.status(400).json({ message: "Fichier manquant" });

    // Vérifie que le produit appartient au fournisseur connecté
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.supplierId !== supplierId) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    // Construit l’URL publique du fichier
    const relativePath = path.join("uploads", "products", file.filename);
    const publicUrl = `${BASE_URL}/${relativePath.replace(/\\/g, "/")}`;

    // Ajoute le lien dans la liste des images du produit
    const images = Array.isArray(product.images)
      ? [...product.images, publicUrl]
      : [publicUrl];

    const updated = await prisma.product.update({
      where: { id: productId },
      data: { images },
    });

    return res.json({
      message: "Image uploadée avec succès",
      url: publicUrl,
      product: updated,
    });
  } catch (err) {
    console.error("uploadProductImage:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Upload d’une preuve de paiement
export const uploadOrderProof = async (req, res) => {
  try {
    const supplierId = req.userId;
    const orderId = Number(req.params.id);
    const file = req.file;

    if (!file) return res.status(400).json({ message: "Fichier manquant" });

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.supplierId !== supplierId) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const relativePath = path.join("uploads", "payment-proofs", file.filename);
    const publicUrl = `${BASE_URL}/${relativePath.replace(/\\/g, "/")}`;

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { paymentProofUrl: publicUrl },
    });

    return res.json({
      message: "Preuve enregistrée avec succès",
      url: publicUrl,
      order: updated,
    });
  } catch (err) {
    console.error("uploadOrderProof:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
