import OpenAI from "openai";
import { Json } from "../types/supabase"; // From supabase.ts

interface Question {
    index: number;
    prompt: string;
    type: string;
    difficulty: "easy" | "medium" | "hard";
}

const OPENAI_MODEL = "gpt-4o";
const THROTTLE_SEC = 30; // Configurable
const AI_TIMEOUT_MS = 30000;
const MAX_RETRIES = 2;

const PROMPT_TEMPLATE = `
You are an expert interview question generator for job roles.
Generate exactly {count} unique, diverse interview questions for the role: {role}.
Include a mix of question types: technical, behavioral, situational, general.
Tags to incorporate: {tags}.
Difficulty level: {difficulty}
Ensure no repetitions and high diversity in topics and phrasing.
CRITICAL: Generate EXACTLY {count} questions - no more, no less. The array must have exactly {count} items. If the difficulty is 'mixed', vary the difficulty across questions.

Output format requirements:
1. Return ONLY a JSON array with {count} question objects.
2. Each object must have these EXACT properties: index (number starting from 1), prompt (question text), type (string e.g. 'technical'), difficulty ('easy'|'medium'|'hard').
3. The array length must equal {count}.
4. No additional text before or after the JSON array.
5. No explanations, no markdown code block markers, no "here are the questions" introductory text.

Example output for {count} questions:
[{"index":1,"prompt":"Describe a time you overcame a challenge.","type":"behavioral","difficulty":"medium"}, {"index":2,"prompt":"Explain how you would approach a difficult technical problem.","type":"technical","difficulty":"hard"}]
`;

const STRICTER_INSTRUCTIONS = (count: number) =>
    `\nSTRICT REMINDER: Generate EXACTLY ${count} questions - no more, no less. Return ONLY a JSON array with ${count} items. No additional text or explanations.`;

const FALLBACK_QUESTIONS: Question[] = [
    {
        index: 1,
        prompt: "Tell me about yourself.",
        type: "general",
        difficulty: "easy",
    },
    {
        index: 2,
        prompt: "What are your strengths?",
        type: "behavioral",
        difficulty: "easy",
    },
    {
        index: 3,
        prompt: "Describe a project you worked on.",
        type: "technical",
        difficulty: "medium",
    },
    {
        index: 4,
        prompt: "How do you handle conflict?",
        type: "situational",
        difficulty: "medium",
    },
    {
        index: 5,
        prompt: "Where do you see yourself in 5 years?",
        type: "general",
        difficulty: "hard",
    },
];

interface GenerateParams {
    role?: string;
    tags?: string[];
    count: number;
    difficulty?: "easy" | "medium" | "hard" | "mixed";
    user_id: string; // For logging
}

async function generateInterviewQuestions(
    params: GenerateParams,
): Promise<{ questions: Question[]; rawResponse?: Json }> {
    const {
        role = "general position",
        tags = [],
        count,
        difficulty = "mixed",
        user_id,
    } = params;
    if (count < 1 || count > 20) throw new Error("Count must be 1-20");

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error("OPENAI_API_KEY environment variable is required");
    }
    const client = new OpenAI({ apiKey, timeout: AI_TIMEOUT_MS });

    let prompt = PROMPT_TEMPLATE.replace("{count}", count.toString())
        .replace("{role}", role)
        .replace("{tags}", tags.join(", ") || "none")
        .replace("{difficulty}", difficulty);

    let retries = 0;
    let rawResponse: string | undefined;
    const startTime = Date.now();

    while (retries <= MAX_RETRIES) {
        try {
            const finalPrompt =
                prompt + (retries > 0 ? STRICTER_INSTRUCTIONS(count) : "");

            const completion = await client.chat.completions.create({
                model: OPENAI_MODEL,
                messages: [
                    {
                        role: "system",
                        content: finalPrompt,
                    },
                ],
                max_tokens: 2000,
            });

            rawResponse = completion.choices[0].message.content ?? "";
            const latency = Date.now() - startTime;
            const tokens = completion.usage?.total_tokens ?? 0;
            console.log(
                `AI call success: user=${user_id}, model=${OPENAI_MODEL}, tokens=${tokens}, latency=${latency}ms`,
            );

            // Handle different possible response formats from the AI
            const parsed: any = JSON.parse(rawResponse);
            let questionArray: any[];

            if (Array.isArray(parsed)) {
                // Direct array format
                questionArray = parsed;
            } else if (parsed.questions && Array.isArray(parsed.questions)) {
                // Object with questions array format
                questionArray = parsed.questions;
            } else if (parsed.result && Array.isArray(parsed.result)) {
                // Object with result array format
                questionArray = parsed.result;
            } else {
                throw new Error(
                    "Invalid AI output structure: no questions array found",
                );
            }

            if (!validateQuestions(questionArray, count)) {
                throw new Error("Invalid AI output structure");
            }

            // Properly cast each question to ensure correct difficulty type
            const validatedQuestions: Question[] = questionArray.map((q) => ({
                index: q.index,
                prompt: q.prompt,
                type: q.type,
                difficulty: q.difficulty as "easy" | "medium" | "hard",
            }));

            return {
                questions: validatedQuestions,
                rawResponse: rawResponse as Json,
            };
        } catch (error: any) {
            retries++;
            const latency = Date.now() - startTime;
            console.error(
                `AI call error (retry ${retries}): user=${user_id}, error=${error.message}, latency=${latency}ms`,
            );
            if (retries > MAX_RETRIES || error.code === "timeout") {
                console.warn(`AI fallback triggered for user=${user_id}`);
                return { questions: FALLBACK_QUESTIONS.slice(0, count) };
            }
        }
    }
    throw new Error("AI generation failed after retries");
}

function validateQuestions(
    questions: any[],
    expectedCount: number,
): questions is Question[] {
    return (
        Array.isArray(questions) &&
        questions.length === expectedCount &&
        questions.every(
            (q, i) =>
                typeof q === "object" &&
                q.index === i + 1 &&
                typeof q.prompt === "string" &&
                typeof q.type === "string" &&
                (q.difficulty === "easy" ||
                    q.difficulty === "medium" ||
                    q.difficulty === "hard"),
        )
    );
}

export { generateInterviewQuestions, type Question };
