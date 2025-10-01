import express from "express";
import { submitApplication, getApplicationStatus } from "../../controllers/application/applicationController";

const router = express.Router();

router.post("/", submitApplication);
router.get("/:id/status", getApplicationStatus);

export default router;
