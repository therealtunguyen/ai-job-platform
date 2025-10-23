import React, { useState } from "react";
import { Play, HelpCircle, ArrowLeft } from "lucide-react";

interface InterviewConfigProps {
  onConfigComplete: (config: {
    questionCount: number;
    difficulty: string;
    aiModel: string;
    interviewType: string;
  }) => void;
  onBack?: () => void;
}

const InterviewConfig: React.FC<InterviewConfigProps> = ({
  onConfigComplete,
  onBack,
}) => {
  const [questionCount, setQuestionCount] = useState<number>(3);
  const [difficulty, setDifficulty] = useState<string>("medium");
  const [aiModel, setAiModel] = useState<string>("gpt-3.5-turbo");
  const [interviewType, setInterviewType] = useState<string>("technical");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Validation states
  const [questionCountError, setQuestionCountError] = useState<string>("");

  // Available models with descriptions
  const availableModels = [
    {
      id: "gpt-3.5-turbo",
      name: "GPT-3.5 Turbo",
      speed: "Fast",
      cost: "Low",
      quality: "Good",
    },
    {
      id: "gpt-4",
      name: "GPT-4",
      speed: "Medium",
      cost: "Medium",
      quality: "Better",
    },
    {
      id: "gpt-4o",
      name: "GPT-4 Omni",
      speed: "Fast",
      cost: "High",
      quality: "Best",
    },
    {
      id: "gpt-4o-mini",
      name: "GPT-4 Omni Mini",
      speed: "Fast",
      cost: "Low",
      quality: "Good",
    },
  ];

  // Validate question count
  const validateQuestionCount = (value: number) => {
    if (value < 1) {
      setQuestionCountError("Minimum 1 question required");
      return false;
    }
    if (value > 5) {
      setQuestionCountError("Maximum 5 questions allowed");
      return false;
    }
    setQuestionCountError("");
    return true;
  };

  const handleQuestionCountChange = (value: number) => {
    setQuestionCount(value);
    validateQuestionCount(value);
  };

  const handleStartInterview = () => {
    if (validateQuestionCount(questionCount) && !isLoading) {
      setIsLoading(true);
      onConfigComplete({
        questionCount,
        difficulty,
        aiModel,
        interviewType,
      });
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      {onBack && (
        <button
          onClick={onBack}
          className="mb-6 flex cursor-pointer items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </button>
      )}

      <div className="rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Configure Your Mock Interview
          </h1>
          <p className="mt-2 text-gray-600">
            Customize your interview experience with these options
          </p>
        </div>

        {/* Configuration Form */}
        <div className="space-y-8">
          {/* Number of Questions */}
          <div className="border-b border-gray-200 pb-8">
            <div className="mb-4 flex items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Number of Questions
              </h2>
              <div className="group relative ml-2">
                <HelpCircle className="h-4 w-4 cursor-help text-gray-500" />
                <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden w-64 -translate-x-1/2 transform rounded bg-gray-800 p-2 text-xs text-white group-hover:block">
                  Choose between 1 to 5 questions for your interview
                </div>
              </div>
            </div>

            <div className="relative flex items-center space-x-4">
              <button
                type="button"
                onClick={() =>
                  handleQuestionCountChange(Math.max(1, questionCount - 1))
                }
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-200 transition-colors hover:bg-gray-300"
                aria-label="Decrease question count"
              >
                -
              </button>

              <div>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={questionCount}
                  onChange={(e) =>
                    handleQuestionCountChange(Number(e.target.value))
                  }
                  className={`w-20 rounded-lg border py-2 text-center ${
                    questionCountError
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                />
              </div>

              {questionCountError && (
                <div className="absolute right-1 text-sm text-red-500">
                  {questionCountError}
                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  handleQuestionCountChange(Math.min(5, questionCount + 1))
                }
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-200 transition-colors hover:bg-gray-300"
                aria-label="Increase question count"
              >
                +
              </button>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              Selected: {questionCount} question{questionCount !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="border-b border-gray-200 pb-8">
            <div className="mb-4 flex items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Difficulty Level
              </h2>
              <div className="group relative ml-2">
                <HelpCircle className="h-4 w-4 cursor-help text-gray-500" />
                <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden w-64 -translate-x-1/2 transform rounded bg-gray-800 p-2 text-xs text-white group-hover:block">
                  Choose the difficulty level of questions
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  value: "easy",
                  label: "Easy",
                  description: "Beginner level questions",
                },
                {
                  value: "medium",
                  label: "Medium",
                  description: "Intermediate level questions",
                },
                {
                  value: "hard",
                  label: "Hard",
                  description: "Advanced level questions",
                },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDifficulty(option.value)}
                  className={`cursor-pointer rounded-xl border-2 p-4 transition-colors ${
                    difficulty === option.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-medium text-gray-900">
                    {option.label}
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    {option.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Model Selection */}
          <div className="border-b border-gray-200 pb-8">
            <div className="mb-4 flex items-center">
              <h2 className="text-xl font-semibold text-gray-900">AI Model</h2>
              <div className="group relative ml-2">
                <HelpCircle className="h-4 w-4 cursor-help text-gray-500" />
                <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden w-64 -translate-x-1/2 transform rounded bg-gray-800 p-2 text-xs text-white group-hover:block">
                  Select the AI model to generate your interview questions
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {availableModels.map((model) => (
                <div
                  key={model.id}
                  onClick={() => setAiModel(model.id)}
                  className={`cursor-pointer rounded-xl border-2 p-4 transition-colors ${
                    aiModel === model.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">
                        {model.name}
                      </div>
                      <div className="mt-1 flex space-x-4 text-sm text-gray-600">
                        <span>Speed: {model.speed}</span>
                        <span>Cost: {model.cost}</span>
                        <span>Quality: {model.quality}</span>
                      </div>
                    </div>
                    <input
                      type="radio"
                      checked={aiModel === model.id}
                      onChange={() => {}}
                      className="h-4 w-4 text-blue-600"
                      aria-label={`Select ${model.name}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interview Type */}
          <div className="pb-8">
            <div className="mb-4 flex items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Interview Type
              </h2>
              <div className="group relative ml-2">
                <HelpCircle className="h-4 w-4 cursor-help text-gray-500" />
                <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden w-64 -translate-x-1/2 transform rounded bg-gray-800 p-2 text-xs text-white group-hover:block">
                  Choose the type of questions for your interview
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                {
                  value: "technical",
                  label: "Technical",
                  description: "Coding, algorithms, system design",
                },
                {
                  value: "behavioral",
                  label: "Behavioral",
                  description: "Behavioral and soft skills questions",
                },
                {
                  value: "general",
                  label: "General",
                  description: "Mix of technical and behavioral",
                },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setInterviewType(option.value)}
                  className={`cursor-pointer rounded-xl border-2 p-6 transition-colors ${
                    interviewType === option.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-medium text-gray-900">
                    {option.label}
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    {option.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Start Interview Button */}
        <div className="mt-10 flex justify-center">
          <button
            onClick={handleStartInterview}
            disabled={!!questionCountError || isLoading}
            className={`flex items-center space-x-2 rounded-xl px-8 py-4 text-lg font-semibold transition-colors ${
              questionCountError || isLoading
                ? "cursor-not-allowed bg-gray-300 text-gray-500"
                : "cursor-pointer bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isLoading ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
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
  );
};

export default InterviewConfig;
