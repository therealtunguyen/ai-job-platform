import EmployerLayout from "@/components/Employer/EmployerLayout";
import { useState, useEffect } from "react";
import { useJobOperations } from "@/hooks/useJobOperations";
import {
  applicationService,
  type Application,
  type ApplicationStatus,
} from "@/services/applicationService";
import type { Job } from "@/services/jobService";

// Define application status options as per requirements
const STATUS_OPTIONS: Exclude<ApplicationStatus, null>[] = [
  "SUBMITTED",
  "REVIEWED",
  "SHORTLISTED",
  "INTERVIEWED",
  "OFFERED",
  "ACCEPTED",
  "REJECTED",
  "WITHDRAWN",
];

const ApplicationViewerContent = () => {
  const { jobs, loading: jobsLoading, error: jobsError } = useJobOperations();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingApplicationId, setUpdatingApplicationId] = useState<
    string | null
  >(null);

  // Fetch applications when a job is selected
  useEffect(() => {
    if (selectedJob) {
      fetchApplications();
    } else {
      setApplications([]);
    }
  }, [selectedJob]);

  const fetchApplications = async () => {
    if (!selectedJob) return;

    try {
      setLoading(true);
      const applicationsData = await applicationService.getApplicationsByJob(
        selectedJob.job_id,
      );
      setApplications(applicationsData);
      setError(null);
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError("Failed to load applications. Please try again later.");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    applicationId: string,
    newStatus: ApplicationStatus,
  ) => {
    setUpdatingApplicationId(applicationId); // Set loading state for the specific application

    try {
      // Update the application status in the backend
      const updatedApplicationResponse =
        await applicationService.updateApplicationStatus(
          applicationId,
          newStatus,
        );

      // Validate that the response has the required fields
      if (!updatedApplicationResponse) {
        throw new Error("Invalid response from update application service");
      }

      // Update the application in the local state
      setApplications((prevApplications) => {
        return prevApplications.map((app) => {
          if (app.application_id === applicationId) {
            return {
              ...updatedApplicationResponse, // Apply updated data (status, etc.)
            };
          }
          return app;
        });
      });

      // Update the selected application if it's the one being edited
      if (
        selectedApplication &&
        selectedApplication.application_id === applicationId
      ) {
        setSelectedApplication((prev) => {
          if (!prev) return prev; // If no previous selected application, return as is

          return {
            ...updatedApplicationResponse, // Apply updated data
          };
        });
      }
    } catch (err) {
      console.error("Error updating application status:", err);
      setError("Failed to update application status. Please try again.");
    } finally {
      setUpdatingApplicationId(null); // Clear loading state
    }
  };

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedApplication(null);
  };

  const openResumeInNewTab = (resumePath: string | undefined) => {
    console.log("Resume path:", resumePath);
    if (!resumePath) return;

    // Open in a new tab
    window.open(resumePath, "_blank", "noopener,noreferrer");
  };

  const getStatusColor = (status: ApplicationStatus | null) => {
    if (!status) return "bg-gray-100 text-gray-800";

    switch (status.toLowerCase()) {
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "reviewed":
        return "bg-yellow-100 text-yellow-800";
      case "shortlisted":
        return "bg-purple-100 text-purple-800";
      case "interviewed":
        return "bg-indigo-100 text-indigo-800";
      case "offered":
        return "bg-green-100 text-green-800";
      case "accepted":
        return "bg-green-600 text-white";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "withdrawn":
        return "bg-gray-300 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (jobsLoading) {
    return (
      <div className="p-8">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-gray-600">Loading jobs...</p>
          </div>
        </div>
      </div>
    );
  }

  if (jobsError) {
    return (
      <div className="p-8">
        <div
          className="relative rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
          role="alert"
        >
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{jobsError}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Application Management
          </h1>
          <p className="text-gray-600">
            View and manage applications for your job postings
          </p>
        </div>

        {/* Job Selection */}
        <div className="mb-8 rounded-xl bg-white p-6 shadow-md">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <label
                htmlFor="job-select"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Select a Job Posting
              </label>
              <select
                id="job-select"
                value={selectedJob?.job_id || ""}
                onChange={(e) => {
                  const job =
                    jobs.find((j) => j.job_id === e.target.value) || null;
                  setSelectedJob(job);
                }}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 md:w-96"
              >
                <option value="">Select a job posting...</option>
                {jobs.map((job) => (
                  <option key={job.job_id} value={job.job_id}>
                    {job.title} - {job.location}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-sm text-gray-500">
              {selectedJob && (
                <span>
                  Showing {applications.length} application
                  {applications.length !== 1 ? "s" : ""} for "
                  {selectedJob.title}"
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Applications Table */}
        {selectedJob ? (
          <div className="overflow-hidden rounded-xl bg-white shadow-md">
            {error && (
              <div
                className="m-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
                role="alert"
              >
                <strong className="font-bold">Error! </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {loading ? (
              <div className="flex h-64 items-center justify-center p-8">
                <div className="text-center">
                  <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
                  <p className="text-gray-600">Loading applications...</p>
                </div>
              </div>
            ) : applications.length === 0 ? (
              <div className="p-12 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
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
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  No applications
                </h3>
                <p className="mt-1 text-gray-500">
                  No one has applied to this job yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                      >
                        Applicant
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                      >
                        Applied Date
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
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {applications.map((application) => (
                      <tr
                        key={application.application_id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              {application.job_seekers.profile_picture ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={application.job_seekers.profile_picture}
                                  alt={
                                    application.job_seekers.full_name ||
                                    "Applicant"
                                  }
                                />
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                                  <span className="font-medium text-gray-600">
                                    {application.job_seekers.full_name
                                      ? application.job_seekers.full_name
                                          .charAt(0)
                                          .toUpperCase()
                                      : "?"}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {application.job_seekers.full_name || "N/A"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {application.job_seekers.email ||
                                  "No email provided"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(application.applied_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${getStatusColor(application.status)}`}
                          >
                            {application.status || "SUBMITTED"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                          <button
                            onClick={() => handleViewApplication(application)}
                            className="mr-4 text-blue-600 hover:text-blue-900"
                          >
                            View Details
                          </button>
                          <select
                            value={application.status ?? "SUBMITTED"}
                            onChange={(e) =>
                              handleStatusChange(
                                application.application_id,
                                e.target.value as ApplicationStatus,
                              )
                            }
                            disabled={
                              updatingApplicationId ===
                              application.application_id
                            }
                            className={`ml-2 rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-blue-500 ${
                              updatingApplicationId ===
                              application.application_id
                                ? "cursor-not-allowed opacity-50"
                                : ""
                            }`}
                          >
                            {STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                          {updatingApplicationId ===
                            application.application_id && (
                            <span className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl bg-white p-12 text-center shadow-md">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              Select a job posting
            </h3>
            <p className="mt-1 text-gray-500">
              Please select a job from the dropdown above to view applications.
            </p>
          </div>
        )}

        {/* Application Detail Modal */}
        {isModalOpen && selectedApplication && (
          <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-xl bg-white shadow-xl">
              <div className="p-6">
                <div className="mb-6 flex items-start justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Application Details
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg
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

                <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">
                      Applicant Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium">
                          {selectedApplication.job_seekers.full_name || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">
                          {selectedApplication.job_seekers.email || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">
                          {selectedApplication.job_seekers.phone || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Applied Date</p>
                        <p className="font-medium">
                          {formatDate(selectedApplication.applied_at)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">
                      Application Status
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Current Status</p>
                        <p
                          className={`inline-flex rounded-full px-2 text-sm leading-5 font-medium font-semibold ${getStatusColor(selectedApplication.status)}`}
                        >
                          {selectedApplication.status || "SUBMITTED"}
                        </p>
                      </div>
                      <div>
                        <label
                          htmlFor="status-select"
                          className="mb-1 block text-sm font-medium text-gray-700"
                        >
                          Update Status
                        </label>
                        <div className="relative">
                          <select
                            id="status-select"
                            value={selectedApplication.status ?? "SUBMITTED"}
                            onChange={(e) =>
                              handleStatusChange(
                                selectedApplication.application_id,
                                e.target.value as ApplicationStatus,
                              )
                            }
                            disabled={
                              updatingApplicationId ===
                              selectedApplication.application_id
                            }
                            className={`w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none ${
                              updatingApplicationId ===
                              selectedApplication.application_id
                                ? "cursor-not-allowed opacity-50"
                                : ""
                            }`}
                          >
                            {STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                          {updatingApplicationId ===
                            selectedApplication.application_id && (
                            <div className="absolute top-1/2 right-2 -translate-y-1/2">
                              <span className="inline-block h-5 w-5 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    Cover Letter
                  </h3>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="whitespace-pre-line text-gray-700">
                      {selectedApplication.job_seekers.summary ||
                        "No cover letter provided."}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    Resume
                  </h3>
                  {selectedApplication.job_seekers.cv_file_path ? (
                    <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center">
                        <svg
                          className="mr-3 h-8 w-8 text-red-500"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900">
                          Resume
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          openResumeInNewTab(
                            selectedApplication.job_seekers.cv_file_path!,
                          )
                        }
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:cursor-pointer hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                      >
                        View PDF
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <p className="text-gray-700">No resume uploaded.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ApplicationViewer = () => {
  return (
    <EmployerLayout activeMenu="/application-viewer">
      <ApplicationViewerContent />
    </EmployerLayout>
  );
};

export default ApplicationViewer;
