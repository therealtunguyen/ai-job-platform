import express from "express";
import {
  saveJobHandler,
  unsaveJobHandler,
  getSavedJobsHandler,
  checkSavedStatusHandler,
  updateSavedJobNotesHandler,
} from "../../controllers/savedJobs/savedJobsController";
import { authenticateToken } from "../../middleware/auth/jwtAuth";

const router = express.Router();

// All routes require authentication (job seekers only)

// Get all saved jobs for the authenticated user
router.get("/", authenticateToken, getSavedJobsHandler);

// Check if a specific job is saved
router.get("/check/:jobId", authenticateToken, checkSavedStatusHandler);

// Save a job
router.post("/", authenticateToken, saveJobHandler);

// Update notes for a saved job
router.patch("/:jobId/notes", authenticateToken, updateSavedJobNotesHandler);

// Unsave a job
router.delete("/:jobId", authenticateToken, unsaveJobHandler);

export default router;
