import React, { useState, useEffect } from "react";
import JobSeekerLayout from "@/components/JobSeeker/JobSeekerLayout";
import {
  interviewApi,
  type InterviewSession,
  type InterviewSummary,
} from "@/services/interviewApi";
import {
  Star,
  MessageSquare,
  Trophy,
  X,
  RefreshCw,
  FileText,
  Send,
  History,
} from "lucide-react";
import InterviewConfigComponent from "@/components/Interview/InterviewConfig";
import PastInterviews from "@/components/Interview/PastInterviews";

interface Evaluation {
  entryId: string;
  responseText: string;
  aiFeedback: {
    evaluation_score?: number;
    feedback_text?: string;
    suggested_improvements?: string;
  };
}

const JobSeekerInterview = () => {
  const [currentInterview, setCurrentInterview] =
    useState<InterviewSession | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [interviewHistory, setInterviewHistory] = useState<InterviewSummary[]>(
    [],
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showConfig, setShowConfig] = useState(true);
  const [showPastInterviews, setShowPastInterviews] = useState(false);

  // Load interview history on component mount
  useEffect(() => {
    fetchInterviewHistory();
  }, []);

  const fetchInterviewHistory = async () => {
    try {
      const response = await interviewApi.getUserInterviews();
      setInterviewHistory(response.interviews || []);
    } catch (error) {
      console.error("Error fetching interview history:", error);
    }
  };

  const startNewInterview = async (config?: {
    questionCount: number;
    difficulty: string;
    aiModel: string;
    interviewType: string;
  }) => {
    try {
      setLoading(true);
      let response;

      if (config) {
        // Starting a new interview
        response = await interviewApi.createInterview(config);
      } else {
        // This would be a default start if we need it
        response = await interviewApi.createInterview({
          questionCount: 3,
          difficulty: "medium",
          aiModel: "gpt-3.5-turbo",
          interviewType: "technical",
        });
      }

      setCurrentInterview(response);
      setEvaluations([]);
      setCurrentQuestionIndex(0);
      setShowEvaluation(false);
      setShowConfig(false); // Hide config screen and show interview
    } catch (error) {
      console.error("Error starting interview:", error);
      alert("Error starting interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resumeInterview = async (sessionId: string) => {
    try {
      setLoading(true);
      // For resuming an interview, we need to get the detailed interview data
      // In a real implementation, we would need an endpoint to resume an existing session
      // Instead, let's just get the existing interview details
      const response = await interviewApi.getInterview(sessionId);

      const interview = response.interview;

      // Construct questions from conversation entries
      const questions = response.conversationEntries.map(
        (entry, index: number) => ({
          index: index,
          prompt: entry.question_text,
          type: entry.question_type,
          difficulty: entry.difficulty,
          entryId: entry.entry_id,
        }),
      );

      // Find the next unanswered question to resume from
      const nextQuestionIndex = response.conversationEntries.findIndex(
        (entry) => !entry.response_text,
      );
      const actualNextIndex =
        nextQuestionIndex === -1 ? questions.length : nextQuestionIndex;

      // Set the current interview state to the resumed one
      setCurrentInterview({
        sessionId: interview.session_id,
        status: interview.status,
        startedAt: interview.started_at,
        aiConfig: interview.config,
        questions: questions,
      });

      // Set to the next unanswered question
      setCurrentQuestionIndex(actualNextIndex);
      setShowEvaluation(false);
      setShowConfig(false);
    } catch (error: unknown) {
      console.error("Error resuming interview:", error);
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "status" in error.response &&
        typeof (error.response as Record<string, unknown>).status ===
          "number" &&
        (error.response as Record<string, number>).status === 404
      ) {
        alert("Interview not found. It may have been removed.");
      } else {
        alert("Error resuming interview. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (entryId: string, responseText: string) => {
    if (!currentInterview) return;

    try {
      setLoading(true);
      const response = await interviewApi.submitAnswer(
        currentInterview.sessionId,
        {
          entryId,
          responseText,
        },
      );

      const newEvaluation: Evaluation = {
        entryId,
        responseText,
        aiFeedback: response.aiFeedback || {},
      };

      setEvaluations((prev) => [...prev, newEvaluation]);

      // Move to next question
      if (currentQuestionIndex < currentInterview.questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        // All questions answered, show evaluation
        setShowEvaluation(true);
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      alert("Error submitting answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = (responseText: string) => {
    if (!currentInterview || !responseText.trim()) return;

    const currentQuestion = currentInterview.questions[currentQuestionIndex];
    submitAnswer(currentQuestion.entryId, responseText);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "text-green-600";
      case "in_progress":
        return "text-yellow-600";
      case "abandoned":
        return "text-red-600";
      case "started":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "text-green-600 bg-green-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "hard":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (showEvaluation && evaluations.length > 0) {
    return (
      <JobSeekerLayout activeMenu="/jobseeker-interview">
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="mx-auto max-w-4xl">
            {/* Evaluation Modal */}
            <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
              <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                <div className="sticky top-0 rounded-t-2xl border-b border-gray-200 bg-white px-8 py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-lg bg-green-100 p-2">
                        <Trophy className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          Interview Evaluation
                        </h2>
                        <p className="text-gray-600">
                          Your performance analysis
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowEvaluation(false);
                        setCurrentInterview(null);
                        fetchInterviewHistory();
                      }}
                      className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-gray-100"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                <div className="space-y-8 p-8">
                  {/* Overall Score */}
                  <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Overall Performance
                        </h3>
                        <p className="text-gray-600">
                          Based on all your answers
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-blue-600">
                          {Math.round(
                            evaluations.reduce(
                              (acc, evaluation) =>
                                acc +
                                (evaluation.aiFeedback.evaluation_score || 0),
                              0,
                            ) / evaluations.length,
                          )}
                          /5
                        </div>
                        <div className="text-sm text-gray-600">
                          Average Score
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Individual Question Evaluations */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Question-by-Question Analysis
                    </h3>
                    {evaluations.map((evaluation, index) => {
                      const question = currentInterview?.questions.find(
                        (q) => q.entryId === evaluation.entryId,
                      );
                      return (
                        <div
                          key={evaluation.entryId}
                          className="rounded-xl border border-gray-200 p-6"
                        >
                          <div className="mb-4 flex items-start justify-between">
                            <div className="flex-1">
                              <div className="mb-2 flex items-center space-x-3">
                                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-600">
                                  Question {index + 1}
                                </span>
                                <span
                                  className={`rounded-full px-3 py-1 text-sm font-medium ${getDifficultyColor(question?.difficulty || "")}`}
                                >
                                  {question?.difficulty}
                                </span>
                              </div>
                              <h4 className="mb-3 text-lg font-semibold text-gray-900">
                                {question?.prompt}
                              </h4>
                              <div className="mb-4 rounded-lg bg-gray-50 p-4">
                                <h5 className="mb-2 font-medium text-gray-900">
                                  Your Answer:
                                </h5>
                                <p className="text-gray-700">
                                  {evaluation.responseText}
                                </p>
                              </div>
                            </div>
                            <div className="ml-6 text-right">
                              <div
                                className={`text-2xl font-bold ${getScoreColor(evaluation.aiFeedback.evaluation_score || 0)}`}
                              >
                                {evaluation.aiFeedback.evaluation_score || 0}/5
                              </div>
                              <div className="mt-1 flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i <
                                      evaluation.aiFeedback.evaluation_score!
                                        ? "fill-current text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>

                          {evaluation.aiFeedback.feedback_text && (
                            <div className="rounded-lg bg-blue-50 p-4">
                              <h5 className="mb-2 flex items-center font-medium text-blue-900">
                                <MessageSquare className="mr-2 h-4 w-4" />
                                AI Feedback
                              </h5>
                              <p className="text-blue-800">
                                {evaluation.aiFeedback.feedback_text}
                              </p>
                            </div>
                          )}

                          {evaluation.aiFeedback.suggested_improvements && (
                            <div className="mt-4 rounded-lg bg-green-50 p-4">
                              <h5 className="mb-2 font-medium text-green-900">
                                Suggestions for Improvement:
                              </h5>
                              <p className="text-green-800">
                                {evaluation.aiFeedback.suggested_improvements}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </JobSeekerLayout>
    );
  }

  if (currentInterview) {
    const currentQuestion = currentInterview.questions[currentQuestionIndex];
    const progress =
      (currentQuestionIndex / currentInterview.questions.length) * 100;

    const abandonInterview = async () => {
      if (currentInterview) {
        try {
          await interviewApi.abandonInterview(currentInterview.sessionId);
          setCurrentInterview(null);
          setShowConfig(true);
          fetchInterviewHistory();
        } catch (error) {
          console.error("Error abandoning interview:", error);
          alert("Error abandoning interview. Please try again.");
        }
      }
    };

    const saveAndExit = async () => {
      // For save and exit, we just go back to the config screen without changing the status on the server
      // The backend will maintain the "in_progress" status automatically
      setCurrentInterview(null);
      setShowConfig(true);
      fetchInterviewHistory(); // Refresh the history to show the in-progress interview
    };

    return (
      <JobSeekerLayout activeMenu="/jobseeker-interview">
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="mx-auto max-w-4xl">
            {/* Interview Header */}
            <div className="mb-6 rounded-2xl bg-white shadow-xl">
              <div className="rounded-t-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-lg bg-white/20 p-3">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold">
                        Mock Interview Session
                      </h1>
                      <p className="text-blue-100">
                        Answer the questions to get AI evaluation
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={saveAndExit}
                      className="cursor-pointer rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
                    >
                      Save & Exit
                    </button>
                    <button
                      onClick={abandonInterview}
                      className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
                    >
                      Exit & Abandon
                    </button>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="px-8 py-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Question {currentQuestionIndex + 1} of{" "}
                    {currentInterview.questions.length}
                  </span>
                  <span className="text-sm text-gray-500">
                    {Math.round(progress)}% Complete
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Question Card */}
            <div className="mb-6 rounded-2xl bg-white shadow-xl">
              <div className="p-8">
                <div className="mb-6 flex items-center space-x-3">
                  <span className="rounded-full bg-blue-100 px-4 py-2 font-medium text-blue-600">
                    Question {currentQuestionIndex + 1}
                  </span>
                  <span
                    className={`rounded-full px-4 py-2 font-medium ${getDifficultyColor(currentQuestion.difficulty)}`}
                  >
                    {currentQuestion.difficulty}
                  </span>
                  <span className="rounded-full bg-purple-100 px-4 py-2 font-medium text-purple-600">
                    {currentQuestion.type}
                  </span>
                </div>

                <h2 className="mb-6 text-xl leading-relaxed font-semibold text-gray-900">
                  {currentQuestion.prompt}
                </h2>

                <AnswerForm
                  onSubmit={handleAnswerSubmit}
                  loading={loading}
                  isLastQuestion={
                    currentQuestionIndex ===
                    currentInterview.questions.length - 1
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </JobSeekerLayout>
    );
  }

  if (showPastInterviews) {
    return (
      <PastInterviews
        onBack={() => setShowPastInterviews(false)}
        onResumeInterview={resumeInterview}
      />
    );
  }

  // Main interview dashboard
  return (
    <JobSeekerLayout activeMenu="/jobseeker-interview">
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Interview Practice
            </h1>
            <p className="mt-2 text-gray-600">
              Practice with AI-powered technical interviews
            </p>
          </div>

          {showConfig ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Interview Configuration */}
              <div className="lg:col-span-2">
                <InterviewConfigComponent
                  onConfigComplete={startNewInterview}
                />
              </div>

              {/* Interview Stats and Actions */}
              <div className="space-y-6">
                <div className="rounded-2xl bg-white p-6 shadow-xl">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    Interview Statistics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Interviews</span>
                      <span className="font-semibold">
                        {interviewHistory.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Completed</span>
                      <span className="font-semibold text-green-600">
                        {
                          interviewHistory.filter(
                            (i) => i.status.toLowerCase() === "completed",
                          ).length
                        }
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">In Progress</span>
                      <span className="font-semibold text-yellow-600">
                        {
                          interviewHistory.filter(
                            (i) => i.status.toLowerCase() === "in_progress",
                          ).length
                        }
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Avg. Score</span>
                      <span className="font-semibold text-blue-600">
                        {(() => {
                          const completedInterviews = interviewHistory.filter(
                            (i) =>
                              i.status.toLowerCase() === "completed" &&
                              i.overall_score !== null,
                          );
                          if (completedInterviews.length === 0) return "N/A";
                          const totalScore = completedInterviews.reduce(
                            (sum, interview) =>
                              sum + (interview.overall_score || 0),
                            0,
                          );
                          const totalQuestion = completedInterviews.reduce(
                            (sum, interview) =>
                              sum + (interview.total_questions || 0),
                            0,
                          );
                          return (
                            ((totalScore / (totalQuestion * 5)) * 10).toFixed(
                              1,
                            ) + "/10"
                          );
                        })()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-xl">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    Recent Interviews
                  </h3>
                  <div className="space-y-3">
                    {interviewHistory.slice(0, 3).map((interview) => (
                      <div
                        key={interview.session_id}
                        className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {formatTime(interview.started_at)}
                          </p>
                          <p
                            className={`text-sm ${getStatusColor(interview.status)}`}
                          >
                            {interview.status}
                          </p>
                        </div>
                      </div>
                    ))}
                    {interviewHistory.length === 0 && (
                      <p className="py-4 text-center text-sm text-gray-500">
                        No interviews yet
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => setShowPastInterviews(true)}
                    className="mt-6 flex w-full items-center justify-center space-x-2 rounded-lg bg-gray-100 px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-200"
                  >
                    <History className="h-4 w-4" />
                    <span>View All Past Interviews</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Interview in progress - will be handled by the if blocks above
            <div>Interview in progress...</div>
          )}
        </div>
      </div>
    </JobSeekerLayout>
  );
};

// Answer Form Component
interface AnswerFormProps {
  onSubmit: (answer: string) => void;
  loading: boolean;
  isLastQuestion: boolean;
}

const AnswerForm: React.FC<AnswerFormProps> = ({
  onSubmit,
  loading,
  isLastQuestion,
}) => {
  const [answer, setAnswer] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim()) {
      onSubmit(answer.trim());
      setAnswer("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Your Answer
        </label>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={6}
          className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          placeholder="Type your answer here..."
          disabled={loading}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">{answer.length} characters</div>
        <button
          type="submit"
          disabled={loading || !answer.trim()}
          className="flex cursor-pointer items-center space-x-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>
                {isLastQuestion ? "Submit & Evaluate" : "Next Question"}
              </span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default JobSeekerInterview;
