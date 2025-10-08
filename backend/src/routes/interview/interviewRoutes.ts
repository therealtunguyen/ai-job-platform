import express from "express";
import { authenticateToken } from "../../middleware/auth/jwtAuth";
import {
    startInterview,
    submitAnswer,
    getUserInterviews,
    getInterviewById,
    abandonInterview,
} from "../../controllers/interview/interviewController";

const router = express.Router();

router.post("/create", authenticateToken, startInterview);
router.post("/:interviewId/submit", authenticateToken, submitAnswer);
router.get("/:interviewId", authenticateToken, getInterviewById);
router.get("/", authenticateToken, getUserInterviews);
router.put("/:interviewId/abandon", authenticateToken, abandonInterview);

export default router;
