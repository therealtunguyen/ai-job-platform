import { useState } from "react";
import { useClickOutside } from "@/hooks/useClickOutside";
import { jobService } from "@/services/jobService";
import type { Job as JobType } from "@/services/jobService";

interface JobCardProps {
  job: JobType;
  onJobUpdate: (updatedJob: JobType) => void;
}

const JobCard = ({ job, onJobUpdate }: JobCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: job.title,
    location: job.location,
    job_type: job.job_type,
    min_experience: job.min_experience,
    max_experience: job.max_experience,
    min_salary: job.min_salary,
    max_salary: job.max_salary,
    description: job.description,
    responsibilities: job.responsibilities,
    requirements: job.requirements,
    benefits: job.benefits,
  });
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // Track which action is loading
  const [showActions, setShowActions] = useState(false);
  const actionDropdownRef = useClickOutside<HTMLDivElement>(() =>
    setShowActions(false),
  );

  const handlePauseResume = async () => {
    if (actionLoading) return; // Prevent multiple clicks

    setActionLoading(job.status === "ACTIVE" ? "PAUSING" : "RESUMING");
    try {
      const updatedStatus = job.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
      const updatedJob = await jobService.updateJob(job.job_id, {
        status: updatedStatus,
        last_updated_at: new Date().toISOString(),
      });
      onJobUpdate(updatedJob);
    } catch (error) {
      console.error("Error updating job status:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePublishDraft = async () => {
    if (actionLoading) return; // Prevent multiple clicks

    setActionLoading("PUBLISHING");
    try {
      const updatedJob = await jobService.updateJob(job.job_id, {
        status: "ACTIVE",
        last_updated_at: new Date().toISOString(),
      });
      onJobUpdate(updatedJob);
    } catch (error) {
      console.error("Error publishing draft job:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReopenArchived = async () => {
    if (actionLoading) return; // Prevent multiple clicks

    setActionLoading("REOPENING");
    try {
      const updatedJob = await jobService.updateJob(job.job_id, {
        status: "ACTIVE",
        last_updated_at: new Date().toISOString(),
      });
      onJobUpdate(updatedJob);
    } catch (error) {
      console.error("Error reopening archived job:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleClose = async () => {
    if (actionLoading) return; // Prevent multiple clicks

    setActionLoading("CLOSING");
    try {
      const updatedJob = await jobService.updateJob(job.job_id, {
        status: "ARCHIVED",
        last_updated_at: new Date().toISOString(),
      });
      onJobUpdate(updatedJob);
    } catch (error) {
      console.error("Error closing job:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDuplicate = async () => {
    if (actionLoading) return; // Prevent multiple clicks

    setActionLoading("DUPLICATING");
    try {
      const newJob: Omit<
        JobType,
        "job_id" | "posted_at" | "applicant_count" | "last_updated_at"
      > = {
        title: `${job.title} (Copy)`,
        location: job.location,
        job_type: job.job_type,
        min_experience: job.min_experience,
        max_experience: job.max_experience,
        min_salary: job.min_salary,
        max_salary: job.max_salary,
        description: job.description,
        responsibilities: job.responsibilities,
        requirements: job.requirements,
        benefits: job.benefits,
        status: "DRAFT",
        employer_id: job.employer_id,
      };

      const createdJob = await jobService.createJob(newJob);
      // Reload dashboard to show the new job
      window.location.href = "/employer/job-posting";
    } catch (error) {
      console.error("Error duplicating job:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    try {
      const updatedJob = await jobService.updateJob(job.job_id, {
        title: editForm.title,
        location: editForm.location,
        job_type: editForm.job_type,
        min_experience: editForm.min_experience,
        max_experience: editForm.max_experience,
        min_salary: editForm.min_salary,
        max_salary: editForm.max_salary,
        description: editForm.description,
        responsibilities: editForm.responsibilities,
        requirements: editForm.requirements,
        benefits: editForm.benefits,
        last_updated_at: new Date().toISOString(),
      });
      onJobUpdate(updatedJob);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving job:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      title: job.title,
      location: job.location,
      job_type: job.job_type,
      min_experience: job.min_experience,
      max_experience: job.max_experience,
      min_salary: job.min_salary,
      max_salary: job.max_salary,
      description: job.description,
      responsibilities: job.responsibilities,
      requirements: job.requirements,
      benefits: job.benefits,
    });
    setIsEditing(false);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800";
      case "PAUSED":
        return "bg-gray-100 text-gray-800";
      case "ARCHIVED":
        return "bg-red-100 text-red-800";
      case "FILLED":
        return "bg-blue-100 text-blue-800";
      case "EXPIRED":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white shadow-md transition-shadow hover:shadow-lg">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            {isEditing ? (
              <input
                type="text"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
                className="w-full border-b border-gray-300 bg-transparent text-lg font-semibold text-gray-900 focus:border-blue-500 focus:outline-none"
              />
            ) : (
              <h3 className="truncate text-lg font-semibold text-gray-900">
                {job.title}
              </h3>
            )}
            <p className="mt-1 text-sm text-gray-500">{job.location}</p>
          </div>
          <span
            className={`ml-2 rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusStyle(job.status)}`}
          >
            {job.status}
          </span>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium">Type:</span>
            <span className="ml-1 capitalize">
              {job.job_type?.replace("_", " ") || "N/A"}
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium">Exp:</span>
            <span className="ml-1">
              {job.min_experience || 0} - {job.max_experience || "No max"} years
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium">Salary:</span>
            <span className="ml-1">
              ${job.min_salary?.toLocaleString() || 0} - $
              {job.max_salary?.toLocaleString() || "No max"}
            </span>
          </div>
        </div>

        {isEditing ? (
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                value={editForm.location}
                onChange={(e) =>
                  setEditForm({ ...editForm, location: e.target.value })
                }
                className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Job Type
              </label>
              <select
                value={editForm.job_type}
                onChange={(e) =>
                  setEditForm({ ...editForm, job_type: e.target.value as any })
                }
                className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                <option value="FULL_TIME">Full-time</option>
                <option value="PART_TIME">Part-time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="TEMPORARY">Temporary</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Min Exp
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={editForm.min_experience || ""}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      min_experience: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
                  }
                  className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Max Exp
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={editForm.max_experience || ""}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      max_experience: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
                  }
                  className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Min Salary
                </label>
                <input
                  type="number"
                  min="0"
                  value={editForm.min_salary || ""}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      min_salary: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
                  }
                  className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="30000"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Max Salary
                </label>
                <input
                  type="number"
                  min="0"
                  value={editForm.max_salary || ""}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      max_salary: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
                  }
                  className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="80000"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <p className="line-clamp-2 text-sm text-gray-600">
              {job.description || "No description provided"}
            </p>
          </div>
        )}

        {job.posted_at && (
          <div className="mt-4 text-xs text-gray-500">
            Posted: {formatDate(job.posted_at)}
            {job.last_updated_at && job.last_updated_at !== job.posted_at && (
              <span className="block">
                Updated: {formatDate(job.last_updated_at)}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="bg-gray-50 px-5 py-3">
        {isEditing ? (
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancelEdit}
              disabled={loading}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={loading}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {`Applicant${job.applicant_count !== 1 ? "s" : ""}`}:{" "}
              {job.applicant_count || 0}
            </div>
            <div className="relative" ref={actionDropdownRef}>
              <button
                onClick={() => setShowActions(!showActions)}
                className="text-sm font-medium text-blue-600 hover:cursor-pointer hover:text-blue-900"
              >
                Actions
              </button>

              {showActions && (
                <div className="absolute right-0 z-10 mt-1 w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                  <button
                    onClick={() => setIsEditing(true)}
                    disabled={actionLoading !== null}
                    className={`block w-full px-4 py-2 text-left text-sm ${
                      actionLoading !== null
                        ? "cursor-not-allowed text-gray-400"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Edit Job
                  </button>

                  {job.status === "DRAFT" && (
                    <button
                      onClick={handlePublishDraft}
                      disabled={actionLoading !== null}
                      className={`block w-full px-4 py-2 text-left text-sm ${
                        actionLoading === "PUBLISHING"
                          ? "text-gray-400"
                          : "text-green-600 hover:bg-gray-100"
                      } ${actionLoading ? "cursor-not-allowed" : ""}`}
                    >
                      {actionLoading === "PUBLISHING" ? (
                        <span className="flex items-center">
                          <svg
                            className="mr-2 -ml-1 h-3 w-3 animate-spin text-gray-400"
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
                          Publishing...
                        </span>
                      ) : (
                        "Publish Job"
                      )}
                    </button>
                  )}

                  {job.status === "ARCHIVED" && (
                    <button
                      onClick={handleReopenArchived}
                      disabled={actionLoading !== null}
                      className={`block w-full px-4 py-2 text-left text-sm ${
                        actionLoading === "REOPENING"
                          ? "text-gray-400"
                          : "text-blue-600 hover:bg-gray-100"
                      } ${actionLoading ? "cursor-not-allowed" : ""}`}
                    >
                      {actionLoading === "REOPENING" ? (
                        <span className="flex items-center">
                          <svg
                            className="mr-2 -ml-1 h-3 w-3 animate-spin text-gray-400"
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
                          Reopening...
                        </span>
                      ) : (
                        "Reopen Job"
                      )}
                    </button>
                  )}

                  {(job.status === "ACTIVE" || job.status === "PAUSED") && (
                    <button
                      onClick={handlePauseResume}
                      disabled={actionLoading !== null}
                      className={`block w-full px-4 py-2 text-left text-sm ${
                        actionLoading === "PAUSING" ||
                        actionLoading === "RESUMING"
                          ? "text-gray-400"
                          : "text-gray-700 hover:bg-gray-100"
                      } ${actionLoading ? "cursor-not-allowed" : ""}`}
                    >
                      {actionLoading === "PAUSING" ||
                      actionLoading === "RESUMING" ? (
                        <span className="flex items-center">
                          <svg
                            className="mr-2 -ml-1 h-3 w-3 animate-spin text-gray-400"
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
                          {job.status === "ACTIVE"
                            ? "Pausing..."
                            : "Resuming..."}
                        </span>
                      ) : job.status === "ACTIVE" ? (
                        "Pause"
                      ) : (
                        "Resume"
                      )}
                    </button>
                  )}

                  <button
                    onClick={handleDuplicate}
                    disabled={actionLoading !== null}
                    className={`block w-full px-4 py-2 text-left text-sm ${
                      actionLoading === "DUPLICATING"
                        ? "text-gray-400"
                        : "text-gray-700 hover:bg-gray-100"
                    } ${actionLoading ? "cursor-not-allowed" : ""}`}
                  >
                    {actionLoading === "DUPLICATING" ? (
                      <span className="flex items-center">
                        <svg
                          className="mr-2 -ml-1 h-3 w-3 animate-spin text-gray-400"
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
                        Duplicating...
                      </span>
                    ) : (
                      "Duplicate Job"
                    )}
                  </button>

                  {job.status !== "ARCHIVED" && (
                    <button
                      onClick={handleClose}
                      disabled={actionLoading !== null}
                      className={`block w-full px-4 py-2 text-left text-sm ${
                        actionLoading === "CLOSING"
                          ? "text-gray-400"
                          : "text-red-600 hover:bg-gray-100"
                      } ${actionLoading ? "cursor-not-allowed" : ""}`}
                    >
                      {actionLoading === "CLOSING" ? (
                        <span className="flex items-center">
                          <svg
                            className="mr-2 -ml-1 h-3 w-3 animate-spin text-gray-400"
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
                          Archiving...
                        </span>
                      ) : (
                        "Archive Job"
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobCard;
