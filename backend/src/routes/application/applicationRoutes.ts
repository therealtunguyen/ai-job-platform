import express from "express";
import * as applicationController from "../../controllers/application/applicationController";

const router = express.Router();

router.post("/", applicationController.submitApplication);
router.get("/:id/status", applicationController.getApplicationStatus);
router.patch("/:id/status", applicationController.updateApplicationStatus);
export default router;
