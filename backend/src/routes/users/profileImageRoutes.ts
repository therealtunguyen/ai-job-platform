import express from "express";
import {
  uploadProfileImage,
  deleteProfileImage,
} from "../../controllers/users/profileImageController";
import { upload } from "../../utils/fileUpload";
import { authenticateToken } from "../../middleware/auth/jwtAuth";

const router = express.Router();

// Upload profile image (requires authentication)
router.post(
  "/upload",
  authenticateToken,
  upload.single("avatar"),
  uploadProfileImage,
);

// Delete profile image (requires authentication)
router.delete("/delete", authenticateToken, deleteProfileImage);

export default router;
