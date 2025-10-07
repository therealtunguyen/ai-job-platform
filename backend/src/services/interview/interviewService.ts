import { supabase } from "../../supabaseClient";
import { TablesInsert, TablesUpdate } from "../../types/supabase";
import {
    generateInterviewQuestions,
    Question,
} from "../../utils/aiQuestionGenerator";
import { type ResponseFeedback } from "../../utils/aiResponseEvaluator";

interface StartInterviewRequest {
    jobId?: string;
    interviewType?: string;
    aiModel?: string;
    difficulty?: "easy" | "medium" | "hard";
    customConfig?: any;
}

interface StartInterviewResponse {
    sessionId: string;
    status: string;
    startedAt: string;
    aiConfig: any;
    questions?: (Question & { entryId: string | null })[];
    message?: string;
}

export const startInterviewService = async (
    candidateId: string,
    requestData: StartInterviewRequest,
): Promise<StartInterviewResponse> => {
    try {
        // Fetch job details if jobId is provided and validate the job exists
        let jobDetails = null;
        let requiredSkills: string[] = [];

        if (requestData.jobId) {
            // First, get the job details
            const { data: jobData, error: jobError } = await supabase
                .from("jobs")
                .select("title, description")
                .eq("job_id", requestData.jobId)
                .single();

            if (jobError || !jobData) {
                throw new Error(`Job with ID ${requestData.jobId} not found`);
            }

            jobDetails = jobData;

            // Then, get the required skills for this job
            const { data: skillsData, error: skillsError } = await supabase
                .from("job_required_skills")
                .select(
                    `
                    skill_id,
                    skills(name)
                `,
                )
                .eq("job_id", requestData.jobId);

            if (skillsError) {
                console.warn(
                    `Could not fetch required skills for job ${requestData.jobId}: ${skillsError.message}`,
                );
            } else if (skillsData) {
                // Extract the skill names from the skills object
                const extractedSkills = skillsData
                    .map((skill: any) => skill.skills?.name) // Get the name from the skills object
                    .filter((name: any) => name) as string[]; // Filter out null/undefined and type as string[]

                requiredSkills = extractedSkills;
            }
        }

        // Prepare the new interview record
        const newInterview: TablesInsert<"mock_interviews"> = {
            candidate_id: candidateId,
            status: "STARTED",
            started_at: new Date().toISOString(),
            config: {
                interviewType: requestData.interviewType || "technical",
                aiModel: requestData.aiModel || "gpt-3.5-turbo",
                difficulty: requestData.difficulty || "medium",
                customConfig: requestData.customConfig || {},
                jobId: requestData.jobId,
            },
        };

        // Insert the new interview record
        const { data, error } = await supabase
            .from("mock_interviews")
            .insert(newInterview)
            .select("session_id, status, started_at")
            .single();

        if (error) {
            throw new Error(`Failed to start interview: ${error.message}`);
        }

        // Determine number of questions to generate (default to 5 if not specified, max 10)
        const questionCount =
            requestData.customConfig?.questionCount &&
            typeof requestData.customConfig.questionCount === "number" &&
            requestData.customConfig.questionCount > 0 &&
            requestData.customConfig.questionCount <= 10
                ? requestData.customConfig.questionCount
                : 5;

        // Use the required skills as tags, falling back to job description keywords if no skills found
        let tags: string[] = [...requiredSkills]; // Use the required skills as primary tags

        if (tags.length === 0 && jobDetails?.description) {
            // If no required skills found, extract skills/keywords from the job description
            const descriptionText = jobDetails.description;

            // Common technical skills and keywords to extract (this is a simplified version)
            const skillKeywords = [
                "javascript",
                "python",
                "java",
                "react",
                "angular",
                "vue",
                "node.js",
                "express",
                "sql",
                "mongodb",
                "postgresql",
                "mysql",
                "docker",
                "kubernetes",
                "aws",
                "azure",
                "gcp",
                "git",
                "agile",
                "scrum",
                "rest",
                "graphql",
                "api",
                "frontend",
                "backend",
                "full-stack",
                "devops",
                "ci/cd",
                "testing",
                "tdd",
                "oop",
                "design patterns",
                "algorithms",
                "data structures",
                "microservices",
                "typescript",
                "html",
                "css",
                "sass",
                "redux",
                "next.js",
                "nuxt.js",
                "spring",
                "hibernate",
                "microservices",
                "kafka",
                "redis",
                "elasticsearch",
            ];

            // Find matching keywords in the job description
            const descriptionLower = descriptionText.toLowerCase();
            tags = skillKeywords.filter((keyword) =>
                descriptionLower.includes(keyword.toLowerCase()),
            );

            // If no specific skills were found, use key phrases from the description
            if (tags.length === 0) {
                // Extract potential keywords by splitting on common delimiters and filtering
                const words = descriptionText
                    .split(/[,\s\n.;()]+/)
                    .filter(
                        (word: string) => word.length > 4 && word.length < 20,
                    ); // Filter for meaningful words

                // Take up to 5 of the most unique words
                const uniqueWords = [...new Set(words)].slice(0, 5) as string[];
                tags = uniqueWords;
            }
        }

        // Generate interview questions using the AI utility
        const { questions, rawResponse } = await generateInterviewQuestions({
            role: jobDetails?.title || "general position",
            tags: tags,
            count: questionCount,
            difficulty: requestData.difficulty || "medium",
            user_id: candidateId,
        });

        // Update the interview record with AI response (keep status as STARTED)
        const updatedConfig = {
            ...(newInterview.config as Record<string, any>),
            questions: questions,
        };

        const { error: updateError } = await supabase
            .from("mock_interviews")
            .update({
                ai_raw_response: rawResponse,
                config: updatedConfig,
                // Keep status as STARTED - will change to IN_PROGRESS only after first answer
            })
            .eq("session_id", data.session_id);

        if (updateError) {
            // If updating the interview record fails, log the error but still return success
            // since the interview session was created successfully
            console.error(
                `Failed to update interview record with questions: ${updateError.message}`,
            );
        }

        // Save each generated question to the conversation_entries table
        const conversationEntries = questions.map((question) => ({
            session_id: data.session_id,
            question_text: question.prompt,
            question_type: question.type,
            difficulty: question.difficulty,
            question_asked_at: new Date().toISOString(),
        }));

        let insertedEntries: { entry_id: string }[] = [];
        if (conversationEntries.length > 0) {
            const { data: insertedData, error: conversationError } =
                await supabase
                    .from("conversation_entries")
                    .insert(conversationEntries)
                    .select("entry_id"); // Select the entry_id of inserted records

            if (conversationError) {
                console.error(
                    `Failed to save conversation entries: ${conversationError.message}`,
                );
            } else {
                insertedEntries = insertedData;
            }
        }

        // Create a mapping of questions with their corresponding entry IDs
        const questionsWithEntryIds = questions.map((question, index) => ({
            ...question,
            entryId: insertedEntries[index]?.entry_id || null,
        }));

        return {
            sessionId: data.session_id,
            status: "STARTED", // Return the initial status
            startedAt: data.started_at,
            aiConfig: newInterview.config,
            questions: questionsWithEntryIds,
            message: "Interview started successfully",
        };
    } catch (error: any) {
        console.error("Error starting interview:", error);

        // If there was an error after the interview session was created,
        // try to mark it as failed in the database
        if (
            error.message.includes("Failed to start interview") ||
            error.message.includes("Job with ID")
        ) {
            return {
                sessionId: "",
                status: "FAILED",
                startedAt: new Date().toISOString(),
                aiConfig: {},
                message: error.message,
            };
        }

        throw new Error(`Error starting interview: ${error.message}`);
    }
};

export const getUserInterviewsService = async (candidateId: string) => {
    try {
        const { data, error } = await supabase
            .from("mock_interviews")
            .select("*")
            .eq("candidate_id", candidateId)
            .order("started_at", { ascending: false }); // Order by most recent first

        if (error) {
            throw new Error(
                `Failed to retrieve user interviews: ${error.message}`,
            );
        }

        return data;
    } catch (error: any) {
        console.error("Error retrieving user interviews:", error);
        throw new Error(`Error retrieving user interviews: ${error.message}`);
    }
};

export const getInterviewByIdService = async (
    sessionId: string,
    candidateId: string,
) => {
    try {
        const { data, error } = await supabase
            .from("mock_interviews")
            .select("*")
            .eq("session_id", sessionId)
            .eq("candidate_id", candidateId) // Verify that the user owns this session
            .single();

        if (error) {
            throw new Error(
                `Failed to retrieve interview session: ${error.message}`,
            );
        }

        if (!data) {
            throw new Error("Interview session not found");
        }

        return data;
    } catch (error: any) {
        console.error("Error retrieving interview by ID:", error);
        throw new Error(`Error retrieving interview session: ${error.message}`);
    }
};

export const updateInterviewSessionService = async (
    sessionId: string,
    candidateId: string,
    updateData: TablesUpdate<"mock_interviews">,
) => {
    try {
        const { data, error } = await supabase
            .from("mock_interviews")
            .update(updateData)
            .eq("session_id", sessionId)
            .eq("candidate_id", candidateId)
            .select()
            .single();

        if (error) {
            throw new Error(
                `Failed to update interview session: ${error.message}`,
            );
        }

        return data;
    } catch (error: any) {
        console.error("Error updating interview session:", error);
        throw new Error(`Error updating interview session: ${error.message}`);
    }
};

// Interface for submit answer service response
export interface SubmitAnswerResponse {
    success: boolean;
    entryId?: string;
    responseText?: string;
    error?: string;
    aiFeedback?: any;
    questionContext: {
        questionText: string;
        questionType: string;
        difficulty: "easy" | "medium" | "hard";
        jobTitle?: string;
    };
}

/**
 * Service function to submit an answer to an interview question
 */
export const submitAnswerService = async (
    userId: string,
    sessionId: string,
    entryId: string,
    responseText: string,
): Promise<SubmitAnswerResponse> => {
    try {
        // First, verify that the user owns this interview session
        const { data: sessionData, error: sessionError } = await supabase
            .from("mock_interviews")
            .select("session_id, candidate_id, config")
            .eq("session_id", sessionId)
            .eq("candidate_id", userId)
            .single();

        if (sessionError || !sessionData) {
            return {
                success: false,
                error: "Interview session not found or access denied",
                questionContext: {
                    questionText: "",
                    questionType: "",
                    difficulty: "medium",
                    jobTitle: undefined,
                },
            };
        }

        // Verify that the entry belongs to this session and user
        const { data: entryData, error: entryError } = await supabase
            .from("conversation_entries")
            .select("entry_id, question_text, question_type, difficulty")
            .eq("entry_id", entryId)
            .eq("session_id", sessionId)
            .single();

        if (entryError || !entryData) {
            return {
                success: false,
                error: "Question entry not found",
                questionContext: {
                    questionText: "",
                    questionType: "",
                    difficulty: "medium",
                    jobTitle: undefined,
                },
            };
        }

        // Update the conversation entry with the user's response
        const { error: responseError } = await supabase
            .from("conversation_entries")
            .update({
                response_text: responseText,
                response_submitted_at: new Date().toISOString(),
            })
            .eq("entry_id", entryId);

        if (responseError) {
            return {
                success: false,
                error: `Failed to save response: ${responseError.message}`,
                questionContext: {
                    questionText: entryData.question_text,
                    questionType: entryData.question_type,
                    difficulty: entryData.difficulty as
                        | "easy"
                        | "medium"
                        | "hard",
                    jobTitle: undefined,
                },
            };
        }

        // Check if this is the first answered question to update session status to IN_PROGRESS
        const { count: answeredQuestions } = await supabase
            .from("conversation_entries")
            .select("*", { count: "exact" })
            .eq("session_id", sessionId)
            .not("response_text", "is", null);

        console.log(
            `Response submitted. Total answered questions: ${answeredQuestions}`,
        );

        // Update session status to IN_PROGRESS if this is the first answer
        if (answeredQuestions === 1) {
            const { error: statusUpdateError } = await supabase
                .from("mock_interviews")
                .update({
                    status: "IN_PROGRESS",
                })
                .eq("session_id", sessionId);

            if (statusUpdateError) {
                console.error(
                    "Error updating session to IN_PROGRESS:",
                    statusUpdateError,
                );
                // Don't fail the submission if this update fails
            }
        }

        // Check if all questions are answered to update session status to COMPLETED
        const { count: totalQuestions } = await supabase
            .from("conversation_entries")
            .select("*", { count: "exact" })
            .eq("session_id", sessionId);

        // Update session status if all questions are answered
        if (answeredQuestions === totalQuestions) {
            const { error: sessionUpdateError } = await supabase
                .from("mock_interviews")
                .update({
                    status: "COMPLETED",
                    completed_at: new Date().toISOString(),
                })
                .eq("session_id", sessionId);

            if (sessionUpdateError) {
                console.error(
                    "Error updating session to completed:",
                    sessionUpdateError,
                );
                // Don't fail the submission if this update fails
            }
        }

        // Get job title for context if available
        let jobTitle: string | undefined;
        if (sessionData.config && sessionData.config.jobId) {
            const { data: jobData, error: jobError } = await supabase
                .from("jobs")
                .select("title")
                .eq("job_id", sessionData.config.jobId)
                .single();

            if (!jobError && jobData) {
                jobTitle = jobData.title;
            }
        }

        return {
            success: true,
            entryId: entryId,
            responseText: responseText,
            questionContext: {
                questionText: entryData.question_text,
                questionType: entryData.question_type,
                difficulty: entryData.difficulty as "easy" | "medium" | "hard",
                jobTitle: jobTitle,
            },
        };
    } catch (error: any) {
        console.error("Error in submitAnswerService:", error);
        return {
            success: false,
            error: error.message,
            questionContext: {
                questionText: "",
                questionType: "",
                difficulty: "medium",
                jobTitle: undefined,
            },
        };
    }
};

/**
 * Function to update interview metrics after responses are submitted
 */
export const updateInterviewMetrics = async (sessionId: string) => {
    try {
        const { data: metricsData, error: metricsError } = await supabase.rpc(
            "update_interview_metrics",
            {
                p_session_id: sessionId,
            },
        );

        if (metricsError) {
            console.error(
                "Error calling update_interview_metrics function:",
                metricsError,
            );
            throw metricsError;
        }

        return metricsData;
    } catch (error: any) {
        console.error("Error updating interview metrics:", error);
        throw error;
    }
};

/* Function to submit AI feedback and update both conversation_entries and interview_feedback tables */
export const submitAnswerWithAiFeedback = async (
    entryId: string,
    sessionId: string,
    feedback: ResponseFeedback,
) => {
    try {
        // Update the conversation entry with AI evaluation
        const { error: conversationError } = await supabase
            .from("conversation_entries")
            .update({
                ai_evaluation_score: feedback.evaluation_score,
                ai_feedback: feedback.feedback_text,
                suggested_improvements: feedback.suggested_improvements,
                response_quality: feedback.response_quality,
            })
            .eq("entry_id", entryId);

        if (conversationError) {
            console.error(
                "Error updating conversation entry with AI results:",
                conversationError,
            );
            throw conversationError;
        }

        // Create interview feedback record
        const feedbackRecord = {
            session_id: sessionId,
            entry_id: entryId,
            feedback_text: feedback.feedback_text,
            ai_suggestion: feedback.suggested_improvements,
            score_obtained: feedback.evaluation_score,
            feedback_category: feedback.response_quality,
            created_at: new Date().toISOString(),
        };

        const { error: feedbackError } = await supabase
            .from("interview_feedback")
            .insert(feedbackRecord);

        if (feedbackError) {
            console.error(
                "Error creating interview feedback record:",
                feedbackError,
            );
            throw feedbackError;
        }

        return { success: true };
    } catch (error: any) {
        console.error("Error in submitAnswerWithAiFeedback:", error);
        throw error;
    }
};

/**
 * Function to abandon an interview session
 */
export const abandonInterviewSession = async (
    sessionId: string,
    userId: string,
) => {
    try {
        const { data, error } = await supabase
            .from("mock_interviews")
            .update({
                status: "ABANDONED",
                completed_at: new Date().toISOString(),
            })
            .eq("session_id", sessionId)
            .eq("candidate_id", userId)
            .select()
            .single();

        if (error) {
            throw new Error(
                `Failed to abandon interview session: ${error.message}`,
            );
        }

        return data;
    } catch (error: any) {
        console.error("Error abandoning interview session:", error);
        throw new Error(`Error abandoning interview session: ${error.message}`);
    }
};
