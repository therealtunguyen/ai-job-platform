import express from "express";
import {
  createJob,
  getJob,
  updateJob,
  deleteJob,
  listJobHandler,
} from "../../controllers/jobs/jobController";
import {
  createJobValidator,
  updateJobValidator,
} from "../../middleware/validation/jobValidation";
import { authenticateToken } from "../../middleware/auth/jwtAuth";

const router = express.Router();

// Public routes: anyone can list and view jobs
router.get("/", listJobHandler);
router.get("/:id", getJob);

// Protected routes: only authenticated users can create, update, or delete jobs
router.post("/", authenticateToken, createJobValidator, createJob);
router.put("/:id", authenticateToken, updateJobValidator, updateJob);
router.delete("/:id", authenticateToken, deleteJob);

export default router;
