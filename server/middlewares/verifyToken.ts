// server/middlewares/verifyToken.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
dotenv.config();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "change_me";

export const verifyToken = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || req.headers.Authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token manquant" });
    }
    const token = auth.split(" ")[1];
    const payload: any = jwt.verify(token, JWT_SECRET);
    // expecting payload.userId & payload.role (or userId only)
    const userId = payload.userId || payload.userId || payload.userId || payload.userId || payload.userId;
    const role = payload.role || payload.role || undefined;

    if (!userId) return res.status(401).json({ message: "Token invalide" });

    // attach to req
    req.userId = Number(userId);
    req.userRole = role;

    // optionally fetch user role from DB if not present
    if (!req.userRole) {
      const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
      if (!user) return res.status(401).json({ message: "Utilisateur introuvable" });
      req.userRole = user.role;
    }

    return next();
  } catch (err) {
    console.error("verifyToken:", err);
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
};
