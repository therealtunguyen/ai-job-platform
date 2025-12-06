import express from "express";
import { getEmployers } from "../../controllers/employer/employerController";

const router = express.Router();

// Public route to list employers (used by /find-employers page)
router.get("/", getEmployers);

export default router;

