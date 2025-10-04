import { supabase } from "../../supabaseClient";
import { TablesInsert, TablesUpdate } from "../../types/supabase";
import {
    generateInterviewQuestions,
    Question,
} from "../../utils/aiQuestionGenerator";

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
    questions?: Question[];
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

        // Update the interview record with AI response and change status to IN_PROGRESS
        const updatedConfig = {
            ...(newInterview.config as Record<string, any>),
            questions: questions,
        };

        const { error: updateError } = await supabase
            .from("mock_interviews")
            .update({
                ai_raw_response: rawResponse,
                config: updatedConfig,
                status: "IN_PROGRESS", // Update status to IN_PROGRESS after questions are generated
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
        const conversationEntries = questions.map(question => ({
            session_id: data.session_id,
            question_text: question.prompt,
            question_type: question.type,
            difficulty: question.difficulty,
            question_asked_at: new Date().toISOString()
        }));

        if (conversationEntries.length > 0) {
            const { error: conversationError } = await supabase
                .from("conversation_entries")
                .insert(conversationEntries);

            if (conversationError) {
                console.error(
                    `Failed to save conversation entries: ${conversationError.message}`,
                );
            }
        }

        return {
            sessionId: data.session_id,
            status: "IN_PROGRESS", // Return the updated status
            startedAt: data.started_at,
            aiConfig: newInterview.config,
            questions: questions,
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

export const getInterviewSessionService = async (
    sessionId: string,
    candidateId: string,
) => {
    try {
        const { data, error } = await supabase
            .from("mock_interviews")
            .select("*")
            .eq("session_id", sessionId)
            .eq("candidate_id", candidateId)
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
        console.error("Error retrieving interview session:", error);
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
