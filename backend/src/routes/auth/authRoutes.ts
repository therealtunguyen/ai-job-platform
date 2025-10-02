import express from "express";
import {
    register,
    login,
    logout,
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

// Get current user profile
router.get("/me", getCurrentUserProfile);

export default router;
