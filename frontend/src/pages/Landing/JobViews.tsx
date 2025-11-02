import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPath";
import type { Database } from "@/types/supabase";
import { applicationService } from "@/services/applicationService";

type Job = Database["public"]["Tables"]["jobs"]["Row"];

const JobViews = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [applyingJobs, setApplyingJobs] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Check user role and redirect if necessary
    if (isAuthenticated && user?.role === "EMPLOYER") {
      navigate("/employer-dashboard");
      return;
    }

    fetchJobs();
  }, [isAuthenticated, user, navigate]);

  const fetchJobs = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.JOBS.LIST, {
        params: { status: "ACTIVE" },
      });
      // Handle different response formats
      if (response.data && response.data.data) {
        setJobs(response.data.data);
      } else if (Array.isArray(response.data)) {
        setJobs(response.data);
      } else {
        setJobs([]);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId: string) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!user?.id) {
      alert("User information not available. Please log in again.");
      return;
    }

    // Add job to applying state
    setApplyingJobs((prev) => new Set(prev).add(jobId));

    try {
      await applicationService.submitApplication({
        job_id: jobId,
        candidate_id: user.id,
        cover_letter: "",
        status: "SUBMITTED",
      });

      setAppliedJobs((prev) => new Set(prev).add(jobId));
      alert("Application submitted successfully!");
    } catch (error) {
      console.error("Error applying for job:", error);
      alert("Failed to apply for the job. Please try again.");
    } finally {
      // Remove job from applying state
      setApplyingJobs((prev) => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  const handleSaveJob = (jobId: string) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setSavedJobs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-2xl font-semibold text-gray-700">
          Loading jobs...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 pt-24 pb-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
            Find Your <span className="text-[#29436c]">Dream Job</span>
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-gray-600">
            Discover thousands of job opportunities tailored to your skills and
            career goals
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <motion.div
                key={job.job_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg transition-shadow duration-300 hover:shadow-xl"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <h3 className="mb-2 text-xl font-bold text-gray-900">
                      {job.title}
                    </h3>
                    <button
                      onClick={() => handleSaveJob(job.job_id)}
                      className={`rounded-full p-2 ${
                        savedJobs.has(job.job_id)
                          ? "text-red-500 hover:text-red-600"
                          : "text-gray-400 hover:text-red-500"
                      }`}
                      aria-label={
                        savedJobs.has(job.job_id) ? "Unsave job" : "Save job"
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill={
                          savedJobs.has(job.job_id) ? "currentColor" : "none"
                        }
                        stroke="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>

                  <p className="mb-2 flex items-center text-gray-600">
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
                  </p>

                  <div className="mb-4 flex items-center text-sm text-gray-500">
                    <span className="mr-4">
                      {job.job_type ? (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                          {job.job_type}
                        </span>
                      ) : (
                        "Type not specified"
                      )}
                    </span>
                    <span>
                      {job.min_experience !== null &&
                      job.max_experience !== null
                        ? `${job.min_experience} - ${job.max_experience} years`
                        : job.min_experience !== null
                          ? `Min: ${job.min_experience} years`
                          : job.max_experience !== null
                            ? `Max: ${job.max_experience} years`
                            : "Experience not specified"}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-lg font-semibold text-[#29436c]">
                      {formatSalary(job.min_salary, job.max_salary)}
                    </p>
                  </div>

                  <div className="mb-6">
                    <p className="line-clamp-3 text-gray-700">
                      {job.description?.substring(0, 150) ||
                        "No description provided"}
                      ...
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Posted: {formatDate(job.posted_at)}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          if (appliedJobs.has(job.job_id)) {
                            alert("You have already applied for this job!");
                          } else {
                            handleApply(job.job_id);
                          }
                        }}
                        disabled={
                          appliedJobs.has(job.job_id) ||
                          applyingJobs.has(job.job_id)
                        }
                        className={`rounded-lg px-4 py-2 font-medium transition-all duration-300 ${
                          appliedJobs.has(job.job_id) ||
                          applyingJobs.has(job.job_id)
                            ? "cursor-not-allowed bg-gray-200 text-gray-500"
                            : "bg-gradient-to-r from-[#29436c] to-[#90ad71] text-white shadow-sm hover:from-[#29436c]/90 hover:to-[#90ad71]/90 hover:shadow-md"
                        }`}
                      >
                        {applyingJobs.has(job.job_id) ? (
                          <span className="flex items-center">
                            <svg
                              className="mr-2 -ml-1 h-4 w-4 animate-spin text-white"
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
                          </span>
                        ) : appliedJobs.has(job.job_id) ? (
                          "Applied"
                        ) : (
                          "Apply Now"
                        )}
                      </button>
                      <button
                        onClick={() => navigate(`/job-details/${job.job_id}`)}
                        className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <div className="text-lg text-gray-500">
                No jobs found at the moment.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobViews;
