import express from "express";
import {
    register,
    login,
    logout,
    getCurrentUserProfile,
} from "../../controllers/auth/authController";

const router = express.Router();

// Registration route
router.post("/register", register);

// Login route
router.post("/login", login);

// Logout route
router.post("/logout", logout);

// Get current user profile
router.get("/me", getCurrentUserProfile);

export default router;

