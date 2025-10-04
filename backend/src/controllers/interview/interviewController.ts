import { Request, Response } from "express";
import { startInterviewService } from "../../services/interview/interviewService";

// Function to start an interview
export const startInterview = async (req: Request, res: Response) => {
    try {
        // Extract user from request (assuming authentication middleware adds it)
        const user = (req as any).user;
        if (!user) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        const { jobId, interviewType, aiModel, difficulty, customConfig } = req.body;

        // Validate required fields
        if (!user.id) {
            return res.status(400).json({ error: "User ID is required" });
        }

        // Input validation
        const errors: string[] = [];

        // Validate jobId if provided (should be a valid UUID format)
        if (jobId && typeof jobId !== 'string') {
            errors.push('Job ID must be a string');
        } else if (jobId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(jobId)) {
            errors.push('Job ID must be a valid UUID');
        }

        // Validate interviewType
        if (interviewType && typeof interviewType !== 'string') {
            errors.push('Interview type must be a string');
        }

        // Validate aiModel if provided
        if (aiModel && typeof aiModel !== 'string') {
            errors.push('AI model must be a string');
        }

        // Validate difficulty if provided
        if (difficulty && typeof difficulty !== 'string') {
            errors.push('Difficulty must be a string');
        } else if (difficulty && !['easy', 'medium', 'hard'].includes(difficulty)) {
            errors.push('Difficulty must be one of: easy, medium, hard');
        }

        // Validate customConfig if provided
        if (customConfig !== undefined && typeof customConfig !== 'object') {
            errors.push('Custom config must be an object');
        }

        if (errors.length > 0) {
            return res.status(400).json({ 
                error: "Validation failed", 
                details: errors 
            });
        }

        // Call the service to start the interview
        const result = await startInterviewService(user.id, {
            jobId,
            interviewType,
            aiModel,
            difficulty,
            customConfig,
        });

        res.status(200).json({
            sessionId: result.sessionId,
            status: result.status,
            startedAt: result.startedAt,
            aiConfig: result.aiConfig,
            questions: result.questions,
            message: result.message,
        });
    } catch (error: any) {
        console.error("Error starting interview:", error);
        res.status(500).json({
            error: "Failed to start interview",
            details: error.message,
        });
    }
};

// Placeholder for submitting interview answers
export const submitAnswer = (req: Request, res: Response) => {
    res.status(200).json({ message: "Answer submitted (placeholder)" });
};
