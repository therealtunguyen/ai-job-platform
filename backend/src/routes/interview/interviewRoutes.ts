import express from "express";
import { authenticateToken } from "../../middleware/auth/jwtAuth";
import {
    startInterview,
    submitAnswer,
} from "../../controllers/interview/interviewController";

const router = express.Router();

router.post("/start", authenticateToken, startInterview);
router.post("/:interviewId/submit", authenticateToken, submitAnswer);

export default router;
