import { Request, Response } from "express";
import { supabase } from "../../supabaseClient";
import {
    startInterviewService,
    updateInterviewMetrics,
    submitAnswerService,
    submitAnswerWithAiFeedback,
    getUserInterviewsService,
    getInterviewByIdService,
    abandonInterviewSession,
} from "../../services/interview/interviewService";
import {
    evaluateInterviewResponse,
    type ResponseFeedback,
} from "../../utils/aiResponseEvaluator";

// Function to start an interview
export const startInterview = async (req: Request, res: Response) => {
    try {
        // Extract user from request (assuming authentication middleware adds it)
        const user = (req as any).user;
        if (!user) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        const { jobId, interviewType, aiModel, difficulty, customConfig } =
            req.body;

        // Validate required fields
        if (!user.id) {
            return res.status(400).json({ error: "User ID is required" });
        }

        // Input validation
        const errors: string[] = [];

        // Validate jobId if provided (should be a valid UUID format)
        if (jobId && typeof jobId !== "string") {
            errors.push("Job ID must be a string");
        } else if (
            jobId &&
            !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                jobId,
            )
        ) {
            errors.push("Job ID must be a valid UUID");
        }

        // Validate interviewType
        if (interviewType && typeof interviewType !== "string") {
            errors.push("Interview type must be a string");
        }

        // Validate aiModel if provided
        if (aiModel && typeof aiModel !== "string") {
            errors.push("AI model must be a string");
        }

        // Validate difficulty if provided
        if (difficulty && typeof difficulty !== "string") {
            errors.push("Difficulty must be a string");
        } else if (
            difficulty &&
            !["easy", "medium", "hard"].includes(difficulty)
        ) {
            errors.push("Difficulty must be one of: easy, medium, hard");
        }

        // Validate customConfig if provided
        if (customConfig !== undefined && typeof customConfig !== "object") {
            errors.push("Custom config must be an object");
        }

        if (errors.length > 0) {
            return res.status(400).json({
                error: "Validation failed",
                details: errors,
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

// Function to get all interview sessions for a user
export const getUserInterviews = async (req: Request, res: Response) => {
    try {
        // Extract user from request (assuming authentication middleware adds it)
        const user = (req as any).user;
        if (!user) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        // Call the service to get user interviews
        const interviews = await getUserInterviewsService(user.id);

        res.status(200).json({
            interviews: interviews,
            count: interviews.length,
            message: "Interviews retrieved successfully",
        });
    } catch (error: any) {
        console.error("Error getting user interviews:", error);
        res.status(500).json({
            error: "Failed to retrieve user interviews",
            details: error.message,
        });
    }
};

// Function to get a specific interview by ID
export const getInterviewById = async (req: Request, res: Response) => {
    try {
        // Extract user from request (assuming authentication middleware adds it)
        const user = (req as any).user;
        if (!user) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        const { interviewId } = req.params;

        // Validate required fields
        if (!interviewId) {
            return res.status(400).json({ error: "Session ID is required" });
        }

        // Validate UUID format
        const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(interviewId)) {
            return res.status(400).json({ error: "Invalid session ID format" });
        }

        // Call the service to get the specific interview
        const interview = await getInterviewByIdService(interviewId, user.id);

        // Get the conversation entries for this interview session
        const { data: conversationEntries, error: entriesError } =
            await supabase
                .from("conversation_entries")
                .select("*")
                .eq("session_id", interviewId)
                .order("question_asked_at", { ascending: true });

        if (entriesError) {
            console.error(
                "Error retrieving conversation entries:",
                entriesError,
            );
            // Continue without entries since interview data is available
        }

        res.status(200).json({
            interview: interview,
            conversationEntries: conversationEntries || [],
            message: "Interview retrieved successfully",
        });
    } catch (error: any) {
        console.error("Error getting interview by ID:", error);
        res.status(500).json({
            error: "Failed to retrieve interview",
            details: error.message,
        });
    }
};

// Function to submit an answer to an interview question
export const submitAnswer = async (req: Request, res: Response) => {
    try {
        // Extract user from request (assuming authentication middleware adds it)
        const user = (req as any).user;
        if (!user) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        const { interviewId } = req.params;
        const { entryId, responseText } = req.body;

        // Validate required fields
        if (!interviewId) {
            return res.status(400).json({ error: "Interview ID is required" });
        }

        if (!entryId) {
            return res.status(400).json({ error: "Entry ID is required" });
        }

        if (!responseText) {
            return res.status(400).json({ error: "Response text is required" });
        }

        // Validate UUID formats
        const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(interviewId)) {
            return res
                .status(400)
                .json({ error: "Invalid interview ID format" });
        }

        if (!uuidRegex.test(entryId)) {
            return res.status(400).json({ error: "Invalid entry ID format" });
        }

        // First, submit the answer to record user response
        const result = await submitAnswerService(
            user.id,
            interviewId,
            entryId,
            responseText,
        );
        console.log("Submit answer result:", result);

        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }

        // Generate AI feedback for the response
        let evaluationResult: ResponseFeedback | null = null;
        try {
            // Get the question text for context in evaluation
            const { questionText, questionType, difficulty, jobTitle } =
                result.questionContext;

            const aiEvaluationResult = await evaluateInterviewResponse({
                question: questionText,
                user_response: responseText,
                question_type: questionType,
                difficulty: difficulty,
                job_role: jobTitle,
                user_id: user.id,
            });

            evaluationResult = aiEvaluationResult.feedback;
        } catch (evalError: any) {
            console.error("Error generating AI feedback:", evalError);
            // Continue with submission even if AI evaluation fails,
            // but don't update with AI results
        }

        // If AI evaluation was successful, update both tables with AI data
        if (evaluationResult) {
            try {
                await submitAnswerWithAiFeedback(
                    entryId,
                    interviewId,
                    evaluationResult,
                );
            } catch (atomicUpdateError: any) {
                console.error(
                    "Error in atomic update operation:",
                    atomicUpdateError,
                );
                // The user's response is still saved, but AI data wasn't added
            }
        }

        // Update the mock interview session metrics regardless of AI success
        try {
            await updateInterviewMetrics(interviewId);
        } catch (metricsError: any) {
            console.error("Error updating interview metrics:", metricsError);
            // Don't fail the submission if metrics update fails
        }

        res.status(200).json({
            message: "Answer submitted successfully",
            entryId: result.entryId,
            responseText: result.responseText,
            aiFeedback: evaluationResult || null,
        });
    } catch (error: any) {
        console.error("Error submitting answer:", error);
        res.status(500).json({
            error: "Failed to submit answer",
            details: error.message,
        });
    }
};

// Function to abandon an interview session
export const abandonInterview = async (req: Request, res: Response) => {
    try {
        // Extract user from request (assuming authentication middleware adds it)
        const user = (req as any).user;
        if (!user) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        const { interviewId } = req.params;

        // Validate required fields
        if (!interviewId) {
            return res.status(400).json({ error: "Interview ID is required" });
        }

        // Validate UUID format
        const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(interviewId)) {
            return res
                .status(400)
                .json({ error: "Invalid interview ID format" });
        }

        // Call the service to abandon the interview
        const result = await abandonInterviewSession(interviewId, user.id);

        res.status(200).json({
            sessionId: result.session_id,
            status: result.status,
            completedAt: result.completed_at,
            message: "Interview session abandoned successfully",
        });
    } catch (error: any) {
        console.error("Error abandoning interview:", error);
        res.status(500).json({
            error: "Failed to abandon interview session",
            details: error.message,
        });
    }
};
