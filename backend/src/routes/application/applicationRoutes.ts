import express, { application } from "express";
import * as controller from "../../controllers/application/applicationController";

const router = express.Router();

router.post("/", controller.create);
router.get("/", controller.getByJob);

export default router;
