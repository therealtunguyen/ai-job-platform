import React, { useState, useEffect } from 'react';
import JobSeekerLayout from '@/components/JobSeeker/JobSeekerLayout';
import { API_PATHS } from '@/utils/apiPath';
import axiosInstance from '@/utils/axiosInstance';
import { 
  Play, 
  Star, 
  MessageSquare, 
  Trophy,
  X,
  RefreshCw,
  FileText,
  Timer,
  Send
} from 'lucide-react';

interface Question {
  index: number;
  prompt: string;
  type: string;
  difficulty: string;
  entryId: string;
}

interface InterviewSession {
  sessionId: string;
  status: string;
  startedAt: string;
  aiConfig: any;
  questions: Question[];
}


interface Evaluation {
  entryId: string;
  responseText: string;
  aiFeedback: {
    score?: number;
    feedback?: string;
    suggestions?: string[];
  };
}

const JobSeekerInterview = () => {
  const [currentInterview, setCurrentInterview] = useState<InterviewSession | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [interviewHistory, setInterviewHistory] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Load interview history on component mount
  useEffect(() => {
    fetchInterviewHistory();
  }, []);

  const fetchInterviewHistory = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.INTERVIEWS.GET_USER_INTERVIEWS);
      setInterviewHistory(response.data.interviews || []);
    } catch (error) {
      console.error('Error fetching interview history:', error);
    }
  };

  const startNewInterview = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post(API_PATHS.INTERVIEWS.CREATE, {
        interviewType: 'technical',
        difficulty: 'medium',
        customConfig: {
          questionCount: 3
        }
      });
      
      setCurrentInterview(response.data);
      setEvaluations([]);
      setCurrentQuestionIndex(0);
      setShowEvaluation(false);
    } catch (error) {
      console.error('Error starting interview:', error);
      alert('Error starting interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (entryId: string, responseText: string) => {
    if (!currentInterview) return;
    
    try {
      setLoading(true);
      const response = await axiosInstance.post(
        API_PATHS.INTERVIEWS.SUBMIT_ANSWER.replace(':interviewId', currentInterview.sessionId),
        {
          entryId,
          responseText
        }
      );

      const newEvaluation: Evaluation = {
        entryId,
        responseText,
        aiFeedback: response.data.aiFeedback || {}
      };

      setEvaluations(prev => [...prev, newEvaluation]);
      
      // Move to next question
      if (currentQuestionIndex < currentInterview.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // All questions answered, show evaluation
        setShowEvaluation(true);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Error submitting answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = (responseText: string) => {
    if (!currentInterview || !responseText.trim()) return;
    
    const currentQuestion = currentInterview.questions[currentQuestionIndex];
    submitAnswer(currentQuestion.entryId, responseText);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
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
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-lg bg-green-100 p-2">
                        <Trophy className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Interview Evaluation</h2>
                        <p className="text-gray-600">Your performance analysis</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowEvaluation(false);
                        setCurrentInterview(null);
                        fetchInterviewHistory();
                      }}
                      className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                <div className="p-8 space-y-8">
                  {/* Overall Score */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Overall Performance</h3>
                        <p className="text-gray-600">Based on all your answers</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-blue-600">
                          {Math.round(evaluations.reduce((acc, evaluation) => acc + (evaluation.aiFeedback.score || 0), 0) / evaluations.length)}/10
                        </div>
                        <div className="text-sm text-gray-600">Average Score</div>
                      </div>
                    </div>
                  </div>

                  {/* Individual Question Evaluations */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900">Question-by-Question Analysis</h3>
                    {evaluations.map((evaluation, index) => {
                      const question = currentInterview?.questions.find(q => q.entryId === evaluation.entryId);
                      return (
                        <div key={evaluation.entryId} className="border border-gray-200 rounded-xl p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                                  Question {index + 1}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(question?.difficulty || '')}`}>
                                  {question?.difficulty}
                                </span>
                              </div>
                              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                                {question?.prompt}
                              </h4>
                              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                <h5 className="font-medium text-gray-900 mb-2">Your Answer:</h5>
                                <p className="text-gray-700">{evaluation.responseText}</p>
                              </div>
                            </div>
                            <div className="ml-6 text-right">
                              <div className={`text-2xl font-bold ${getScoreColor(evaluation.aiFeedback.score || 0)}`}>
                                {evaluation.aiFeedback.score || 0}/10
                              </div>
                              <div className="flex items-center space-x-1 mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < Math.round((evaluation.aiFeedback.score || 0) / 2)
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>

                          {evaluation.aiFeedback.feedback && (
                            <div className="bg-blue-50 rounded-lg p-4">
                              <h5 className="font-medium text-blue-900 mb-2 flex items-center">
                                <MessageSquare className="h-4 w-4 mr-2" />
                                AI Feedback
                              </h5>
                              <p className="text-blue-800">{evaluation.aiFeedback.feedback}</p>
                            </div>
                          )}

                          {evaluation.aiFeedback.suggestions && evaluation.aiFeedback.suggestions.length > 0 && (
                            <div className="bg-green-50 rounded-lg p-4 mt-4">
                              <h5 className="font-medium text-green-900 mb-2">Suggestions for Improvement:</h5>
                              <ul className="space-y-1">
                                {evaluation.aiFeedback.suggestions.map((suggestion, i) => (
                                  <li key={i} className="text-green-800 flex items-start">
                                    <span className="text-green-600 mr-2">•</span>
                                    {suggestion}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-center space-x-4 pt-6 border-t border-gray-200">
                    <button
                      onClick={startNewInterview}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>Take Another Interview</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowEvaluation(false);
                        setCurrentInterview(null);
                        fetchInterviewHistory();
                      }}
                      className="flex items-center space-x-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <FileText className="h-4 w-4" />
                      <span>View History</span>
                    </button>
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
    const progress = ((currentQuestionIndex + 1) / currentInterview.questions.length) * 100;

    return (
      <JobSeekerLayout activeMenu="/jobseeker-interview">
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="mx-auto max-w-4xl">
            {/* Interview Header */}
            <div className="bg-white rounded-2xl shadow-xl mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 rounded-t-2xl">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-lg bg-white/20 p-3">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold">Technical Interview</h1>
                      <p className="text-blue-100">Answer the questions to get AI evaluation</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2 text-blue-100">
                      <Timer className="h-4 w-4" />
                      <span>Started: {formatTime(currentInterview.startedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="px-8 py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Question {currentQuestionIndex + 1} of {currentInterview.questions.length}
                  </span>
                  <span className="text-sm text-gray-500">
                    {Math.round(progress)}% Complete
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-2xl shadow-xl mb-6">
              <div className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <span className="bg-blue-100 text-blue-600 px-4 py-2 rounded-full font-medium">
                    Question {currentQuestionIndex + 1}
                  </span>
                  <span className={`px-4 py-2 rounded-full font-medium ${getDifficultyColor(currentQuestion.difficulty)}`}>
                    {currentQuestion.difficulty}
                  </span>
                  <span className="bg-purple-100 text-purple-600 px-4 py-2 rounded-full font-medium">
                    {currentQuestion.type}
                  </span>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 mb-6 leading-relaxed">
                  {currentQuestion.prompt}
                </h2>

                <AnswerForm 
                  onSubmit={handleAnswerSubmit}
                  loading={loading}
                  isLastQuestion={currentQuestionIndex === currentInterview.questions.length - 1}
                />
              </div>
            </div>
          </div>
        </div>
      </JobSeekerLayout>
    );
  }

  // Main interview dashboard
  return (
    <JobSeekerLayout activeMenu="/jobseeker-interview">
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Interview Practice</h1>
            <p className="mt-2 text-gray-600">Practice with AI-powered technical interviews</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Start New Interview */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                    <Play className="h-8 w-8 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Start New Interview</h2>
                  <p className="text-gray-600 mb-8">
                    Get 3 random technical questions with AI-powered evaluation and feedback
                  </p>
                  <button
                    onClick={startNewInterview}
                    disabled={loading}
                    className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2 mx-auto"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        <span>Starting...</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-5 w-5" />
                        <span>Start Interview</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Interview Stats */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Interview Statistics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Interviews</span>
                    <span className="font-semibold">{interviewHistory.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Completed</span>
                    <span className="font-semibold text-green-600">
                      {interviewHistory.filter(i => i.status === 'completed').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">In Progress</span>
                    <span className="font-semibold text-yellow-600">
                      {interviewHistory.filter(i => i.status === 'in_progress').length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Interviews</h3>
                <div className="space-y-3">
                  {interviewHistory.slice(0, 3).map((interview) => (
                    <div key={interview.session_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{formatTime(interview.started_at)}</p>
                        <p className="text-xs text-gray-600">{interview.status}</p>
                      </div>
                      <div className="text-right">
                        {interview.overall_score && (
                          <span className={`font-semibold ${getScoreColor(interview.overall_score)}`}>
                            {interview.overall_score}/10
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {interviewHistory.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4">No interviews yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
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

const AnswerForm: React.FC<AnswerFormProps> = ({ onSubmit, loading, isLastQuestion }) => {
  const [answer, setAnswer] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim()) {
      onSubmit(answer.trim());
      setAnswer('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Answer
        </label>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={6}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
          placeholder="Type your answer here..."
          disabled={loading}
        />
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {answer.length} characters
        </div>
        <button
          type="submit"
          disabled={loading || !answer.trim()}
          className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>{isLastQuestion ? 'Submit & Evaluate' : 'Next Question'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default JobSeekerInterview;