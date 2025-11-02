// server/routes/supplier.routes.js
import express from "express";
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductImages,
  listOrders,
  updateOrderStatus,
  uploadOrderProof,
} from "../controllers/supplier.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { uploadProductImages, uploadSingleProof } from "../middlewares/upload.js";

const router = express.Router();

// All endpoints require auth + supplier role check inside controllers or middleware
router.use(verifyToken);

// PRODUCTS
router.get("/products", listProducts);
router.get("/products/:id", async (req, res) => { /* optional single product */ res.status(501).end(); });
router.post("/products", uploadProductImages, createProduct); // accepts images[]

router.patch("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

// add images
router.post("/products/:id/images", uploadProductImages, addProductImages);

// ORDERS
router.get("/orders", listOrders);
router.patch("/orders/:id/status", updateOrderStatus);

// upload proof (single file field name "proof")
router.post("/orders/:id/upload-proof", uploadSingleProof, uploadOrderProof);

export default router;
