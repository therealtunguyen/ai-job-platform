import express from "express";
import {
  submitApplication,
  getApplicationById,
  updateApplicationStatus,
  listUserApplications,
  listJobApplications,
  listApplicationsForJob,
} from "../../controllers/application/applicationController";
import { authenticateToken } from "../../middleware/auth/jwtAuth";

const router = express.Router();

// Submit a new application
router.post("/", authenticateToken, submitApplication);

// Get complete application data by ID
router.get("/:id", authenticateToken, getApplicationById);

// Update application status
router.patch("/:id/status", authenticateToken, updateApplicationStatus);

// List all applications for a user
router.get("/user/:userId", authenticateToken, listUserApplications);

// List all applications for an employer's jobs
router.get("/employer/:employerId", authenticateToken, listJobApplications);

// List applications for a specific job
router.get("/job/:jobId", authenticateToken, listApplicationsForJob);

export default router;
