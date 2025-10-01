import express from "express";
import {
    createUser,
    getUser,
    updateUser,
} from "../../controllers/users/userController";
import { authenticateToken } from "../../middleware/auth/jwtAuth";

const router = express.Router();

// The POST / route is now handled by auth registration
// router.post("/", createUser); // Removed since registration is handled via /api/auth/register

// Protected routes - require authentication
router.get("/me", authenticateToken, getUser); // Get current user's profile
router.put("/me", authenticateToken, updateUser); // Update current user's profile

export default router;
