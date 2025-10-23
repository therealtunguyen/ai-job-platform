import { API_PATHS } from "@/utils/apiPath";
import axiosInstance from "@/utils/axiosInstance";

export interface InterviewConfig {
  questionCount: number;
  difficulty: string;
  aiModel: string;
  interviewType: string;
  jobId?: string;
}

export interface InterviewSession {
  sessionId: string;
  status: string;
  startedAt: string;
  aiConfig: any;
  questions: Question[];
  message: string;
}

export interface Question {
  index: number;
  prompt: string;
  type: string;
  difficulty: string;
  entryId: string;
}

export interface SubmitAnswerRequest {
  entryId: string;
  responseText: string;
}

export interface SubmitAnswerResponse {
  message: string;
  entryId: string;
  responseText: string;
  aiFeedback: any;
}

export interface InterviewSummary {
  session_id: string;
  candidate_id: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  total_questions: number | null;
  answered_questions: number | null;
  overall_score: number | null;
  config: any;
}

export interface DetailedInterview {
  interview: InterviewSummary;
  conversationEntries: ConversationEntry[];
  message: string;
}

export interface ConversationEntry {
  entry_id: string;
  session_id: string;
  question_text: string;
  response_text: string | null;
  question_type: string;
  difficulty: string;
  response_submitted_at: string | null;
  ai_evaluation_score: number | null;
  ai_feedback: string | null;
  response_quality: string | null;
  suggested_improvements: string | null;
}

export const interviewApi = {
  // Start a new interview
  createInterview: async (
    config: InterviewConfig,
  ): Promise<InterviewSession> => {
    const response = await axiosInstance.post(API_PATHS.INTERVIEWS.CREATE, {
      jobId: config.jobId,
      interviewType: config.interviewType,
      aiModel: config.aiModel,
      difficulty: config.difficulty,
      customConfig: {
        questionCount: config.questionCount,
      },
    });
    return response.data;
  },

  // Submit an answer
  submitAnswer: async (
    interviewId: string,
    request: SubmitAnswerRequest,
  ): Promise<SubmitAnswerResponse> => {
    const response = await axiosInstance.post(
      API_PATHS.INTERVIEWS.SUBMIT_ANSWER.replace(":interviewId", interviewId),
      request,
    );
    return response.data;
  },

  // Get all user interviews
  getUserInterviews: async (): Promise<{
    interviews: InterviewSummary[];
    count: number;
    message: string;
  }> => {
    const response = await axiosInstance.get(
      API_PATHS.INTERVIEWS.GET_USER_INTERVIEWS,
    );
    return response.data;
  },

  // Get a specific interview
  getInterview: async (sessionId: string): Promise<DetailedInterview> => {
    const response = await axiosInstance.get(
      API_PATHS.INTERVIEWS.GET_BY_ID.replace(":interviewId", sessionId),
    );
    return response.data;
  },

  // Abandon an interview
  abandonInterview: async (
    interviewId: string,
  ): Promise<{
    sessionId: string;
    status: string;
    completedAt: string;
    message: string;
  }> => {
    const response = await axiosInstance.put(
      API_PATHS.INTERVIEWS.ABANDON.replace(":interviewId", interviewId),
    );
    return response.data;
  },
};
