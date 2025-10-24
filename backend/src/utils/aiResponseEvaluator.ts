import OpenAI from "openai";
import { Json } from "../types/supabase"; // From supabase.ts

interface ResponseFeedback {
  evaluation_score: number; // 1-5 scale
  feedback_text: string;
  suggested_improvements: string;
  response_quality: "excellent" | "good" | "average" | "poor";
  key_strengths?: string[];
  areas_for_improvement?: string[];
}

interface EvaluateResponseParams {
  question: string;
  user_response: string;
  question_type: string;
  difficulty: "easy" | "medium" | "hard";
  job_role?: string;
  user_id: string; // For logging
}

const OPENAI_MODEL = "gpt-4o";
const AI_TIMEOUT_MS = 30000;
const MAX_RETRIES = 2;

const EVALUATION_PROMPT_TEMPLATE = `
You are an expert interviewer and evaluator. Evaluate the user's response to the given interview question.

Question: {question}
Question Type: {question_type}
Difficulty: {difficulty}
User Response: {user_response}

If the job role is provided, consider how well the response aligns with the position:
Job Role: {job_role}

Evaluate the response based on these criteria:
- Content relevance and completeness
- Clarity of communication
- Specific examples and details
- Alignment with job requirements (if specified)
- Professionalism and appropriateness

Provide your evaluation in the following JSON format:
{
  "evaluation_score": number (1-5),
  "feedback_text": string (detailed feedback),
  "suggested_improvements": string (specific suggestions),
  "response_quality": string ("excellent" | "good" | "average" | "poor"),
  "key_strengths": string[] (list of strengths),
  "areas_for_improvement": string[] (list of improvement areas)
}

CRITICAL: Return ONLY the JSON object with no additional text, explanations, or markdown formatting.
`;

async function evaluateInterviewResponse(
  params: EvaluateResponseParams,
): Promise<{ feedback: ResponseFeedback; rawResponse?: Json }> {
  const {
    question,
    user_response,
    question_type,
    difficulty,
    job_role = "general position",
    user_id,
  } = params;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is required");
  }
  const client = new OpenAI({ apiKey, timeout: AI_TIMEOUT_MS });

  let prompt = EVALUATION_PROMPT_TEMPLATE.replace("{question}", question)
    .replace("{question_type}", question_type)
    .replace("{difficulty}", difficulty)
    .replace("{user_response}", user_response)
    .replace("{job_role}", job_role);

  let retries = 0;
  let rawResponse: string | undefined;
  const startTime = Date.now();

  while (retries <= MAX_RETRIES) {
    try {
      const completion = await client.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          {
            role: "system",
            content: prompt,
          },
        ],
        max_tokens: 1500,
        temperature: 0.3, // Lower temperature for more consistent evaluations
      });

      rawResponse = completion.choices[0].message.content ?? "";

      // Parse the response
      let parsed: any;
      try {
        // Try to extract JSON from the response if it includes extra text
        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          parsed = JSON.parse(rawResponse);
        }
      } catch (parseError) {
        throw new Error(`Failed to parse AI response: ${rawResponse}`);
      }

      // Validate the response structure
      if (!validateFeedback(parsed)) {
        throw new Error("Invalid AI feedback structure");
      }

      // Type assertion to ensure correct types
      const validatedFeedback: ResponseFeedback = {
        evaluation_score: parsed.evaluation_score,
        feedback_text: parsed.feedback_text,
        suggested_improvements: parsed.suggested_improvements,
        response_quality: parsed.response_quality as
          | "excellent"
          | "good"
          | "average"
          | "poor",
        key_strengths: parsed.key_strengths,
        areas_for_improvement: parsed.areas_for_improvement,
      };

      return {
        feedback: validatedFeedback,
        rawResponse: rawResponse as Json,
      };
    } catch (error: any) {
      retries++;
      if (retries > MAX_RETRIES || error.code === "timeout") {
        // Return a fallback evaluation
        return {
          feedback: {
            evaluation_score: 3,
            feedback_text: "Response received, evaluation pending.",
            suggested_improvements:
              "Please provide more specific examples to strengthen your response.",
            response_quality: "average",
            key_strengths: ["Attempted to answer the question"],
            areas_for_improvement: ["Add more specific details and examples"],
          },
        };
      }
    }
  }
  throw new Error("AI evaluation failed after retries");
}

function validateFeedback(feedback: any): feedback is ResponseFeedback {
  return (
    typeof feedback === "object" &&
    typeof feedback.evaluation_score === "number" &&
    feedback.evaluation_score >= 1 &&
    feedback.evaluation_score <= 5 &&
    typeof feedback.feedback_text === "string" &&
    typeof feedback.suggested_improvements === "string" &&
    (feedback.response_quality === "excellent" ||
      feedback.response_quality === "good" ||
      feedback.response_quality === "average" ||
      feedback.response_quality === "poor")
  );
}

export { evaluateInterviewResponse, type ResponseFeedback };
