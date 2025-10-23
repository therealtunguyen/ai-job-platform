import React, { useState, useEffect } from "react";
import {
  Clock,
  Play,
  CheckCircle,
  XCircle,
  FileText,
  Star,
  ArrowLeft,
  Eye,
} from "lucide-react";
import { interviewApi, type InterviewSummary } from "@/services/interviewApi";
import JobSeekerLayout from "@/components/JobSeeker/JobSeekerLayout";

interface PastInterviewsProps {
  onBack?: () => void;
  onResumeInterview?: (sessionId: string) => void;
}

const PastInterviews: React.FC<PastInterviewsProps> = ({
  onBack,
  onResumeInterview,
}) => {
  const [interviews, setInterviews] = useState<InterviewSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] =
    useState<InterviewSummary | null>(null);
  const [detailedInterview, setDetailedInterview] = useState<any>(null);
  const [detailedLoading, setDetailedLoading] = useState(false);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const response = await interviewApi.getUserInterviews();
      setInterviews(response.interviews || []);
      console.log("Fetched interviews:", response.interviews);
    } catch (error) {
      console.error("Error fetching interviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "in_progress":
        return "text-yellow-600 bg-yellow-100";
      case "abandoned":
        return "text-red-600 bg-red-100";
      case "started":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
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

  const formatTime = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  const viewDetailedInterview = async (interview: InterviewSummary) => {
    try {
      setDetailedLoading(true);
      setSelectedInterview(interview);
      const response = await interviewApi.getInterview(interview.session_id);
      setDetailedInterview(response);
    } catch (error) {
      console.error("Error fetching detailed interview:", error);
    } finally {
      setDetailedLoading(false);
    }
  };

  const handleResumeInterview = (sessionId: string) => {
    if (onResumeInterview) {
      onResumeInterview(sessionId);
    }
  };

  if (detailedInterview && selectedInterview) {
    return (
      <JobSeekerLayout activeMenu="/jobseeker-interview">
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="mx-auto max-w-6xl">
            <button
              onClick={() => setDetailedInterview(null)}
              className="mb-6 flex cursor-pointer items-center text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Past Interviews
            </button>

            <div className="rounded-2xl bg-white p-8 shadow-xl">
              <div className="mb-6 border-b border-gray-200 pb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="mb-2 text-2xl font-bold text-gray-900">
                      Interview Details
                    </h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        Started: {formatTime(selectedInterview.started_at)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        Completed: {formatTime(selectedInterview.completed_at)}
                      </div>
                      <div className="flex items-center">
                        <FileText className="mr-1 h-4 w-4" />
                        {selectedInterview.config?.interviewType
                          ? selectedInterview.config.interviewType
                              .charAt(0)
                              .toUpperCase() +
                            selectedInterview.config.interviewType.slice(1)
                          : "Unknown Type"}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(selectedInterview.status)}`}
                  >
                    {selectedInterview.status}
                  </span>
                </div>
              </div>

              <div className="space-y-8">
                {detailedInterview.conversationEntries.map(
                  (entry: any, index: number) => (
                    <div
                      key={entry.entry_id}
                      className="border-b border-gray-200 pb-8 last:border-0 last:pb-0"
                    >
                      <div className="mb-4 flex items-start justify-between">
                        <span className="font-semibold text-gray-900">
                          Question {index + 1}
                        </span>
                        <span
                          className={`rounded px-2 py-1 text-xs font-medium ${getDifficultyColor(entry.difficulty)}`}
                        >
                          {entry.difficulty}
                        </span>
                      </div>

                      <div className="mb-6">
                        <h3 className="mb-3 text-lg font-medium text-gray-900">
                          {entry.question_text}
                        </h3>
                        <div className="rounded-lg bg-gray-50 p-4">
                          <h4 className="mb-2 font-medium text-gray-700">
                            Your Answer:
                          </h4>
                          <p className="text-gray-800">
                            {entry.response_text || "No answer provided"}
                          </p>
                        </div>
                      </div>

                      {entry.ai_feedback && (
                        <div className="rounded-lg bg-blue-50 p-4">
                          <h4 className="mb-2 flex items-center font-medium text-blue-900">
                            <FileText className="mr-2 h-4 w-4" />
                            AI Feedback:
                          </h4>
                          <p className="text-blue-800">{entry.ai_feedback}</p>
                        </div>
                      )}

                      {entry.ai_evaluation_score && (
                        <div className="mt-3 flex items-center">
                          <Star className="mr-1 h-5 w-5 fill-current text-yellow-400" />
                          <span className="font-medium text-gray-700">
                            Evaluation Score: {entry.ai_evaluation_score}/5
                          </span>
                        </div>
                      )}
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </JobSeekerLayout>
    );
  }

  return (
    <JobSeekerLayout activeMenu="/jobseeker-interview">
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-6xl">
          {onBack && (
            <button
              onClick={onBack}
              className="mb-6 flex cursor-pointer items-center text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </button>
          )}

          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              Past Interviews
            </h1>
          </div>

          {loading ? (
            <div className="py-12 text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600">Loading interviews...</p>
            </div>
          ) : interviews.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <h3 className="mb-2 text-xl font-medium text-gray-900">
                No interviews yet
              </h3>
              <p className="text-gray-600">
                Start your first interview to see it here
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                      >
                        Questions
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                      >
                        Difficulty
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                      >
                        Score
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {interviews.map((interview) => (
                      <tr
                        key={interview.session_id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                          {formatTime(interview.started_at)}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                          {interview.config?.interviewType
                            ? interview.config.interviewType
                                .charAt(0)
                                .toUpperCase() +
                              interview.config.interviewType.slice(1)
                            : "Unknown"}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                          {interview.total_questions || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                          {interview.config?.difficulty.toUpperCase() ||
                            "Unknown"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(interview.status)}`}
                          >
                            {interview.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                          {interview.overall_score && interview.total_questions
                            ? `${parseFloat(
                                (
                                  (interview.overall_score /
                                    (interview.total_questions * 5)) *
                                  10
                                ).toFixed(1),
                              )}/10`
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                          {(interview.status.toLowerCase() === "in_progress" ||
                            interview.status.toLowerCase() === "started") && (
                            <button
                              onClick={() =>
                                handleResumeInterview(interview.session_id)
                              }
                              className="mr-4 flex cursor-pointer items-center text-blue-600 hover:text-blue-900"
                            >
                              <Play className="mr-1 h-4 w-4" />
                              Resume
                            </button>
                          )}
                          <button
                            onClick={() => viewDetailedInterview(interview)}
                            className="flex cursor-pointer items-center text-indigo-600 hover:text-indigo-900"
                          >
                            <Eye className="mr-1 h-4 w-4" />
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </JobSeekerLayout>
  );
};

export default PastInterviews;
