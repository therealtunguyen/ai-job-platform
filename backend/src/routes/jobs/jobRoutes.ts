import express from "express";
import {
	createJob,
	getJob,
	updateJob,
	deleteJob,
	listJobHandler,
} from "../../controllers/jobs/jobController";
import { createJobValidator, updateJobValidator } from "../../middleware/validation/jobValidation";

const router = express.Router();

router.get("/", listJobHandler);
router.post("/", createJobValidator, createJob);
router.get("/:id", getJob);
router.put("/:id", updateJobValidator, updateJob);
router.delete("/:id", deleteJob);

export default router;

