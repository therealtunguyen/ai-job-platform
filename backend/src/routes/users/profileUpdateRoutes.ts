import { Router } from "express";
import {
  updateJobSeekerProfileHandler,
  updateEmployerProfileHandler,
  getCurrentUserProfile,
  uploadProfileImageHandler,
  deleteProfileImageHandler,
  updateProfileAndImageHandler,
} from "../../controllers/users/profileUpdateController";
import { authenticateToken } from "../../middleware/auth/jwtAuth";

const router = Router();

// Job Seeker Profile Routes
router.put("/job-seeker", authenticateToken, updateJobSeekerProfileHandler);
router.put(
  "/job-seeker/profile-and-image",
  authenticateToken,
  updateProfileAndImageHandler,
);

// Employer Profile Routes
router.put("/employer", authenticateToken, updateEmployerProfileHandler);
router.put(
  "/employer/profile-and-image",
  authenticateToken,
  updateProfileAndImageHandler,
);

// Common profile routes for both user types
router.get("/me", authenticateToken, getCurrentUserProfile);
router.put("/me/image", authenticateToken, uploadProfileImageHandler);
router.delete("/me/image", authenticateToken, deleteProfileImageHandler);

export default router;
