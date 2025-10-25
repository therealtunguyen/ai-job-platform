import express from "express";
import {
  createJob,
  getJob,
  updateJob,
  deleteJob,
  listJobHandler,
  getJobsByEmployer,
} from "../../controllers/jobs/jobController";
import {
  createJobValidator,
  updateJobValidator,
} from "../../middleware/validation/jobValidation";
import { authenticateToken } from "../../middleware/auth/jwtAuth";

const router = express.Router();

// Public routes: anyone can list and view jobs
router.get("/", listJobHandler);

// Get a specific job by job ID
router.get("/job/:jobId", getJob);

// Get all jobs posted by the authenticated employer
router.get("/my-jobs", authenticateToken, getJobsByEmployer);

// Protected routes: only authenticated users can create, update, or delete jobs
router.post("/", authenticateToken, createJobValidator, createJob);
router.put("/job/:jobId", authenticateToken, updateJobValidator, updateJob);
router.delete("/job/:jobId", authenticateToken, deleteJob);

export default router;
