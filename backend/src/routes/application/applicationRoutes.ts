import express from "express";
import * as applicationController from "../../controllers/application/applicationController";

const router = express.Router();

router.post("/", applicationController.submit);
router.patch("/:id/status", applicationController.updateStatus);

export default router;
