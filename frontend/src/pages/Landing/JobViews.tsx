import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPath";
import type { Database } from "@/types/supabase";
import { applicationService } from "@/services/applicationService";
import { savedJobsService } from "@/services/savedJobsService";
import JobModal from "@/pages/JobSeeker/JobModal";

type Job = Database["public"]["Tables"]["jobs"]["Row"];

const JobViews = () => {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // For initial page load
  const [loadingJobs, setLoadingJobs] = useState<boolean>(false); // For job card loading
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [applyingJobs, setApplyingJobs] = useState<Set<string>>(new Set());
  const [savingJobs, setSavingJobs] = useState<Set<string>>(new Set());

  // Modal states
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter states
  const [titleFilter, setTitleFilter] = useState<string>("");
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [jobTypeFilter, setJobTypeFilter] = useState<string>("");
  const [minSalaryFilter, setMinSalaryFilter] = useState<number | null>(null);
  const [maxSalaryFilter, setMaxSalaryFilter] = useState<number | null>(null);
  const [minExperienceFilter, setMinExperienceFilter] = useState<number | null>(
    null,
  );
  const [maxExperienceFilter, setMaxExperienceFilter] = useState<number | null>(
    null,
  );

  useEffect(() => {
    // Check user role and redirect if necessary
    if (isAuthenticated && user?.role === "EMPLOYER") {
      navigate("/employer-dashboard");
      return;
    }

    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, navigate]);

  const fetchJobs = async () => {
    // Fetch all jobs without filters by calling applyFilters with empty filters
    try {
      setLoading(true); // For initial page load

      // Build query parameters from filter states (which will all be empty in this case)
      const params: Record<string, string | number> = {
        status: "ACTIVE", // Only show active jobs
      };

      const response = await axiosInstance.get(API_PATHS.JOBS.FILTER, {
        params,
      });

      // Handle different response formats
      if (response.data && response.data.data) {
        setJobs(response.data.data);
      } else if (Array.isArray(response.data)) {
        setJobs(response.data);
      } else {
        setJobs([]);
      }

      // Fetch saved jobs if user is authenticated
      if (isAuthenticated && user?.id) {
        try {
          const savedJobsData = await savedJobsService.getSavedJobs();
          const savedJobIds = new Set(
            savedJobsData.map((savedJob) => savedJob.job_id),
          );
          setSavedJobs(savedJobIds);
        } catch (error) {
          console.error("Error fetching saved jobs:", error);
          // Don't fail the entire page if saved jobs fetch fails
          setSavedJobs(new Set());
        }
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
      addToast("User information not available. Please log in again.", "error");
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
      addToast("Application submitted successfully!", "success");
    } catch (error) {
      console.error("Error applying for job:", error);
      addToast("Failed to apply for the job. Please try again.", "error");
    } finally {
      // Remove job from applying state
      setApplyingJobs((prev) => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  const handleSaveJob = async (jobId: string) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Prevent multiple simultaneous saves
    if (savingJobs.has(jobId)) {
      return;
    }

    // Add to saving state
    setSavingJobs((prev) => new Set(prev).add(jobId));

    try {
      const isSaved = savedJobs.has(jobId);

      if (isSaved) {
        // Unsave the job
        await savedJobsService.unsaveJob(jobId);
        setSavedJobs((prev) => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
      } else {
        // Save the job
        await savedJobsService.saveJob(jobId);
        setSavedJobs((prev) => new Set(prev).add(jobId));
      }
    } catch (error) {
      console.error("Error toggling save status:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to save/unsave job. Please try again.";
      addToast(errorMessage, "error");
    } finally {
      // Remove from saving state
      setSavingJobs((prev) => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
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

  const applyFilters = async () => {
    try {
      setLoadingJobs(true);

      // Build query parameters from filter states
      const params: Record<string, string | number> = {
        status: "ACTIVE", // Only show active jobs like in the original fetch
      };

      if (titleFilter) params.title = titleFilter;
      if (locationFilter) params.location = locationFilter;
      if (jobTypeFilter) params.job_type = jobTypeFilter;
      if (minSalaryFilter !== null && minSalaryFilter !== undefined)
        params.min_salary = minSalaryFilter;
      if (maxSalaryFilter !== null && maxSalaryFilter !== undefined)
        params.max_salary = maxSalaryFilter;
      if (minExperienceFilter !== null && minExperienceFilter !== undefined)
        params.min_experience = minExperienceFilter;
      if (maxExperienceFilter !== null && maxExperienceFilter !== undefined)
        params.max_experience = maxExperienceFilter;

      // Use a different API path to hit the filter endpoint
      const response = await axiosInstance.get(API_PATHS.JOBS.FILTER, {
        params,
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
      console.error("Error filtering jobs:", error);
      setJobs([]);
    } finally {
      setLoadingJobs(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 pt-24 pb-12">
      <div className="container mx-auto px-4">
        {loading ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#29436c] border-t-transparent"></div>
              <p className="mt-4 text-lg text-gray-600">Loading page...</p>
            </div>
          </div>
        ) : (
          <>
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
                Discover thousands of job opportunities tailored to your skills
                and career goals
              </p>
            </motion.div>

            {/* Filter Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-10 rounded-xl bg-white p-6 shadow-lg"
            >
              <h2 className="mb-4 text-xl font-semibold text-gray-800">
                Filter Jobs
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {/* Job Title Filter */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={titleFilter}
                    onChange={(e) => setTitleFilter(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#29436c] focus:ring-1 focus:ring-[#29436c] focus:outline-none"
                    placeholder="e.g. Software Engineer"
                  />
                </div>

                {/* Location Filter */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <input
                    type="text"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#29436c] focus:ring-1 focus:ring-[#29436c] focus:outline-none"
                    placeholder="e.g. Ho Chi Minh City"
                  />
                </div>

                {/* Job Type Filter */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Job Type
                  </label>
                  <select
                    value={jobTypeFilter}
                    onChange={(e) => setJobTypeFilter(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#29436c] focus:ring-1 focus:ring-[#29436c] focus:outline-none"
                  >
                    <option value="">All Types</option>
                    <option value="FULL_TIME">Full-time</option>
                    <option value="PART_TIME">Part-time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="FREELANCE">Freelance</option>
                  </select>
                </div>

                {/* Min Salary Filter */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Min Salary ($)
                  </label>
                  <input
                    type="number"
                    value={minSalaryFilter ?? ""}
                    onChange={(e) =>
                      setMinSalaryFilter(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#29436c] focus:ring-1 focus:ring-[#29436c] focus:outline-none"
                    placeholder="Min salary"
                    min="0"
                  />
                </div>

                {/* Max Salary Filter */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Max Salary ($)
                  </label>
                  <input
                    type="number"
                    value={maxSalaryFilter ?? ""}
                    onChange={(e) =>
                      setMaxSalaryFilter(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#29436c] focus:ring-1 focus:ring-[#29436c] focus:outline-none"
                    placeholder="Max salary"
                    min="0"
                  />
                </div>

                {/* Experience Range Filter */}
                <div className="flex flex-col">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Experience Range (years)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={minExperienceFilter ?? ""}
                      onChange={(e) =>
                        setMinExperienceFilter(
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                      className="w-1/2 rounded-md border border-gray-300 px-2 py-2 text-sm focus:border-[#29436c] focus:ring-1 focus:ring-[#29436c] focus:outline-none"
                      placeholder="Min"
                      min="0"
                    />
                    <input
                      type="number"
                      value={maxExperienceFilter ?? ""}
                      onChange={(e) =>
                        setMaxExperienceFilter(
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                      className="w-1/2 rounded-md border border-gray-300 px-2 py-2 text-sm focus:border-[#29436c] focus:ring-1 focus:ring-[#29436c] focus:outline-none"
                      placeholder="Max"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={async () => {
                    setTitleFilter("");
                    setLocationFilter("");
                    setJobTypeFilter("");
                    setMinSalaryFilter(null);
                    setMaxSalaryFilter(null);
                    setMinExperienceFilter(null);
                    setMaxExperienceFilter(null);

                    // Reset to default view with loading state
                    try {
                      setLoadingJobs(true);
                      const response = await axiosInstance.get(
                        API_PATHS.JOBS.FILTER,
                        {
                          params: { status: "ACTIVE" },
                        },
                      );

                      if (response.data && response.data.data) {
                        setJobs(response.data.data);
                      } else if (Array.isArray(response.data)) {
                        setJobs(response.data);
                      } else {
                        setJobs([]);
                      }
                    } catch (error) {
                      console.error("Error resetting filters:", error);
                      setJobs([]);
                    } finally {
                      setLoadingJobs(false);
                    }
                  }}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-[#29436c] focus:ring-offset-2 focus:outline-none"
                >
                  Clear Filters
                </button>
                <button
                  onClick={applyFilters}
                  className="rounded-md bg-[#29436c] px-4 py-2 text-sm font-medium text-white hover:bg-[#29436c]/90 focus:ring-2 focus:ring-[#29436c] focus:ring-offset-2 focus:outline-none"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {loadingJobs ? (
                // Loading state for job cards only
                <div className="col-span-full flex justify-center py-12">
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#29436c] border-t-transparent"></div>
                    <p className="mt-4 text-lg text-gray-600">
                      Loading jobs...
                    </p>
                  </div>
                </div>
              ) : jobs.length > 0 ? (
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
                          disabled={savingJobs.has(job.job_id)}
                          className={`rounded-full p-2 transition-colors ${
                            savingJobs.has(job.job_id)
                              ? "cursor-not-allowed text-gray-300"
                              : savedJobs.has(job.job_id)
                                ? "text-yellow-500 hover:text-yellow-600"
                                : "text-gray-400 hover:text-yellow-500"
                          }`}
                          aria-label={
                            savedJobs.has(job.job_id)
                              ? "Unsave job"
                              : "Save job"
                          }
                        >
                          {savingJobs.has(job.job_id) ? (
                            <svg
                              className="h-5 w-5 animate-spin"
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
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill={
                                savedJobs.has(job.job_id)
                                  ? "currentColor"
                                  : "none"
                              }
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                            </svg>
                          )}
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
                                addToast(
                                  "You have already applied for this job!",
                                  "warning",
                                );
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
                            onClick={() => {
                              setSelectedJob(job);
                              setIsModalOpen(true);
                            }}
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
          </>
        )}
      </div>

      {/* Job Modal */}
      <JobModal
        job={selectedJob}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedJob(null);
        }}
        onApply={handleApply}
        onSave={handleSaveJob}
        isApplied={selectedJob ? appliedJobs.has(selectedJob.job_id) : false}
        isSaved={selectedJob ? savedJobs.has(selectedJob.job_id) : false}
        isApplying={selectedJob ? applyingJobs.has(selectedJob.job_id) : false}
        isSaving={selectedJob ? savingJobs.has(selectedJob.job_id) : false}
      />
    </div>
  );
};

export default JobViews;
