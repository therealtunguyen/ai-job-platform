import express from "express";
import {
    createUser,
    getUser,
    updateUser,
} from "../../controllers/users/userController";
import profileImageRoutes from "./profileImageRoutes";
import profileUpdateRoutes from "./profileUpdateRoutes";
import { authenticateToken } from "../../middleware/auth/jwtAuth";

const router = express.Router();

// Protected routes - require authentication
router.get("/me", authenticateToken, getUser); // Get current user's profile
router.put("/me", authenticateToken, updateUser); // Update current user's profile

// Profile image routes
router.use("/profile-image", profileImageRoutes);

// Profile update routes (job seeker and employer specific)
router.use("/", profileUpdateRoutes);

export default router;
