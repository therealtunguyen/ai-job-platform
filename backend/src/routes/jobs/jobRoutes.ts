import express from "express";
import {
  createJob,
  getJob,
  updateJob,
  deleteJob,
  listJobHandler,
  getJobsByEmployer,
  filterJobsHandler,
} from "../../controllers/jobs/jobController";
import {
  createJobValidator,
  updateJobValidator,
} from "../../middleware/validation/jobValidation";
import {
  authenticateToken,
  optionalAuthenticateToken,
} from "../../middleware/auth/jwtAuth";

const router = express.Router();

// Public routes: anyone can list and view jobs
router.get("/", listJobHandler);

// Filter jobs with query parameters (optional auth to exclude applied jobs for logged-in users)
router.get("/filter", optionalAuthenticateToken, filterJobsHandler);

// Get a specific job by job ID
router.get("/job/:id", getJob);

// Get all jobs posted by the authenticated employer
router.get("/my-jobs", authenticateToken, getJobsByEmployer);

// Protected routes: only authenticated users can create, update, or delete jobs
router.post("/", authenticateToken, createJobValidator, createJob);
router.put("/job/:id", authenticateToken, updateJobValidator, updateJob);
router.delete("/job/:id", authenticateToken, deleteJob);

export default router;
