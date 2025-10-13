import express from "express";
import {
  register,
  login,
  logout,
  refresh,
  updateEmail,
  getCurrentUserProfile,
} from "../../controllers/auth/authController";
import { upload } from "../../utils/fileUpload";

const router = express.Router();

// Registration route (handles both with and without avatar)
router.post("/register", upload.single("avatar"), register);

// Login route
router.post("/login", login);

// Logout route
router.post("/logout", logout);

// Refresh token route
router.post("/refresh", refresh);

// Update email route
router.put("/email", updateEmail);

// Get current user profile
router.get("/me", getCurrentUserProfile);

export default router;
