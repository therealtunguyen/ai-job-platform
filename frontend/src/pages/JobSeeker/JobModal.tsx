import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Job } from "@/services/jobService";

interface JobModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (jobId: string) => void;
  onSave: (jobId: string) => void;
  isApplied: boolean;
  isSaved: boolean;
  isApplying: boolean;
  isSaving: boolean;
}

const JobModal: React.FC<JobModalProps> = ({
  job,
  isOpen,
  onClose,
  onApply,
  onSave,
  isApplied,
  isSaved,
  isApplying,
  isSaving,
}) => {
  if (!job) return null;

  const formatSalary = (min: number | null, max: number | null): string => {
    if (!min && !max) return "Not specified";
    if (!min) return `Up to $${max?.toLocaleString()}`;
    if (!max) return `From $${min?.toLocaleString()}`;
    return `$${min?.toLocaleString()} - $${max?.toLocaleString()}`;
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-[#29436c] to-[#90ad71] px-6 py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {job.title}
                  </h2>
                  <div className="flex flex-wrap gap-3 text-sm text-white/90">
                    <span className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-1 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {job.location || "Not specified"}
                    </span>
                    <span className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-1 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Posted: {formatDate(job.posted_at)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-180px)] px-6 py-6">
              {/* Quick Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="rounded-lg bg-blue-50 p-4">
                  <div className="text-sm text-gray-600 mb-1">Job Type</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {job.job_type || "Not specified"}
                  </div>
                </div>
                <div className="rounded-lg bg-green-50 p-4">
                  <div className="text-sm text-gray-600 mb-1">Salary Range</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatSalary(job.min_salary, job.max_salary)}
                  </div>
                </div>
                <div className="rounded-lg bg-purple-50 p-4">
                  <div className="text-sm text-gray-600 mb-1">Experience</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {job.min_experience !== null && job.max_experience !== null
                      ? `${job.min_experience} - ${job.max_experience} years`
                      : job.min_experience !== null
                        ? `Min: ${job.min_experience} years`
                        : job.max_experience !== null
                          ? `Max: ${job.max_experience} years`
                          : "Not specified"}
                  </div>
                </div>
              </div>

              {/* Job Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-[#29436c]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Job Description
                </h3>
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
                  {job.description || "No description provided"}
                </div>
              </div>

              {/* Requirements */}
              {job.requirements && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-[#29436c]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                      />
                    </svg>
                    Requirements
                  </h3>
                  <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
                    {job.requirements}
                  </div>
                </div>
              )}

              {/* Benefits */}
              {job.benefits && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-[#29436c]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                      />
                    </svg>
                    Benefits
                  </h3>
                  <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
                    {job.benefits}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Status:
                  </span>
                  <span
                    className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      job.status === "ACTIVE"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
                {job.expires_at && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Application Deadline:
                    </span>
                    <span className="ml-2 text-sm text-gray-900">
                      {formatDate(job.expires_at)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-3 justify-end">
                <button
                  onClick={() => onSave(job.job_id)}
                  disabled={isSaving}
                  className={`inline-flex items-center rounded-lg px-4 py-2 font-medium transition-all ${
                    isSaving
                      ? "cursor-not-allowed bg-gray-200 text-gray-500"
                      : isSaved
                        ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {isSaving ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill={isSaved ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                      </svg>
                      {isSaved ? "Saved" : "Save Job"}
                    </>
                  )}
                </button>
                <button
                  onClick={() => onApply(job.job_id)}
                  disabled={isApplied || isApplying}
                  className={`inline-flex items-center rounded-lg px-6 py-2 font-medium transition-all ${
                    isApplied || isApplying
                      ? "cursor-not-allowed bg-gray-200 text-gray-500"
                      : "bg-gradient-to-r from-[#29436c] to-[#90ad71] text-white shadow-sm hover:from-[#29436c]/90 hover:to-[#90ad71]/90 hover:shadow-md"
                  }`}
                >
                  {isApplying ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Applying...
                    </>
                  ) : isApplied ? (
                    "Applied"
                  ) : (
                    "Apply Now"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default JobModal;