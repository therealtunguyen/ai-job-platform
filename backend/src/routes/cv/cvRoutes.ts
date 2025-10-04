import express from "express";
import { uploadCv, getCv } from "../../controllers/cv/cvController";
import { authenticateToken } from "../../middleware/auth/jwtAuth";

const router = express.Router();

// Apply authentication middleware to protect the upload route
router.post("/upload", authenticateToken, uploadCv);
router.get("/:id", authenticateToken, getCv);

export default router;
