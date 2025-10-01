import express from "express";
import { uploadCv, getCv } from "../../controllers/cv/cvController";

const router = express.Router();

router.post("/upload", uploadCv);
router.get("/:id", getCv);

export default router;
