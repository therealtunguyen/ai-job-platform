import express from "express";
import {
    startInterview,
    submitAnswer,
} from "../../controllers/interview/interviewController";

const router = express.Router();

router.post("/start", startInterview);
router.post("/:interviewId/submit", submitAnswer);

export default router;
