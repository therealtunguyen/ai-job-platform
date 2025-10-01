import express from "express";
import { createJob, getJob, updateJob, deleteJob } from "../../controllers/jobs/jobController";

const router = express.Router();

router.post("/", createJob);
router.get("/:id", getJob);
router.put("/:id", updateJob);
router.delete("/:id", deleteJob);

export default router;
