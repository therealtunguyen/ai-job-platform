import { useState, useEffect } from "react";
import JobSeekerLayout from "@/components/JobSeeker/JobSeekerLayout";
import { API_PATHS } from "@/utils/apiPath";
import axiosInstance from "@/utils/axiosInstance";
import {
  Search,
  MapPin,
  Clock,
  Bookmark,
  BookmarkCheck,
  BriefcaseBusiness,
  Building2,
  Eye,
  Send,
} from "lucide-react";

interface Job {
  job_id: string;
  title: string;
  description: string;
  company_name: string;
  employer_company_name?: string;
  location: string;
  min_salary: number;
  max_salary: number;
  job_type: string;
  posted_at: string;
  employer_logo?: string;
  employer?: {
    company_name: string;
    logo?: string;
  };
  is_saved?: boolean;
  is_applied?: boolean;
  application_status?: string;
  applied_at?: string;
}

interface Application {
  application_id: string;
  job_id: string;
  status: string;
  applied_at: string;
  jobs?: Job;
}

const ApplicationSavedJob = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  // const [applications, setApplications] = useState<Application[]>([]);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "applied" | "saved">(
    "all",
  );
  // const [showJobDetails, setShowJobDetails] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const userId = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user")!).id
        : null;
      if (!userId) {
        setJobs([]);
        // setApplications([]);
        setSavedJobs([]);
        return;
      }

      // Fetch user applications
      const applicationsResponse = await axiosInstance.get(
        API_PATHS.APPLICATIONS.GET_USER_APPLICATIONS.replace(
          ":userId",
          userId.toString(),
        ),
      );
      const userApplications =
        applicationsResponse.data?.applications ||
        applicationsResponse.data ||
        [];

      // Fetch job details for each application
      const applicationsWithJobDetails = await Promise.all(
        userApplications.map(async (application: Application) => {
          try {
            const jobResponse = await axiosInstance.get(
              API_PATHS.JOBS.GET_BY_ID.replace(":id", application.job_id),
            );

            return {
              ...application,
              jobs: jobResponse.data?.job || jobResponse.data,
            };
          } catch (error) {
            console.error(
              "Error fetching job details for job_id:",
              application.job_id,
              error,
            );
            return application;
          }
        }),
      );

      // Create job objects from applications
      const appliedJobs = applicationsWithJobDetails
        .filter((app) => app.jobs) // Only include applications with job details
        .map((app) => ({
          ...app.jobs,
          is_applied: true,
          is_saved: false,
          application_status: app.status,
          applied_at: app.applied_at,
        }));

      setJobs(appliedJobs);
      // setApplications(userApplications);

      // TODO: Fetch saved jobs from API when available
      setSavedJobs([]);
    } catch (error) {
      console.error("Error fetching data:", error);
      setJobs([]);
      // setApplications([]);
      setSavedJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // const handleApplyJob = async (jobId: string) => {
  //   try {
  //     const response = await axiosInstance.post(API_PATHS.APPLICATIONS.SUBMIT, {
  //       job_id: jobId
  //     });

  //     if (response.data) {
  //       // Update job status
  //       setJobs(prev => prev.map(job =>
  //         job.job_id === jobId
  //           ? { ...job, is_applied: true }
  //           : job
  //       ));

  //       alert('Application submitted successfully!');
  //     }
  //   } catch (error) {
  //     console.error('Error applying to job:', error);
  //     alert('Error applying to job. Please try again.');
  //   }
  // };

  const handleSaveJob = async (jobId: string) => {
    try {
      // TODO: Implement save job API call
      setJobs((prev) =>
        prev.map((job) =>
          job.job_id === jobId ? { ...job, is_saved: !job.is_saved } : job,
        ),
      );

      alert(
        jobs.find((j) => j.job_id === jobId)?.is_saved
          ? "Job removed from saved"
          : "Job saved successfully!",
      );
    } catch (error) {
      console.error("Error saving job:", error);
      alert("Error saving job. Please try again.");
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  };

  const formatSalary = (min: number, max: number) => {
    return `$${Math.floor(min / 1000)}k - $${Math.floor(max / 1000)}k`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "interview":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterType === "applied") {
      return matchesSearch && job.is_applied;
    } else if (filterType === "saved") {
      return matchesSearch && job.is_saved;
    }

    return matchesSearch;
  });

  // const getApplicationStatus = (jobId: string) => {
  //   const application = applications.find(app => app.job_id === jobId);
  //   return application?.status || null;
  // };

  if (loading) {
    return (
      <JobSeekerLayout activeMenu="/jobseeker-apply-save-job">
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8">
              <div className="h-8 w-64 animate-pulse rounded bg-gray-200"></div>
              <div className="mt-2 h-4 w-96 animate-pulse rounded bg-gray-200"></div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-xl bg-white p-6 shadow-lg"
                >
                  <div className="mb-2 h-6 w-3/4 rounded bg-gray-200"></div>
                  <div className="mb-4 h-4 w-1/2 rounded bg-gray-200"></div>
                  <div className="mb-2 h-4 w-full rounded bg-gray-200"></div>
                  <div className="mb-4 h-4 w-2/3 rounded bg-gray-200"></div>
                  <div className="mb-4 flex gap-2">
                    <div className="h-6 w-16 rounded bg-gray-200"></div>
                    <div className="h-6 w-20 rounded bg-gray-200"></div>
                  </div>
                  <div className="h-8 w-full rounded bg-gray-200"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </JobSeekerLayout>
    );
  }

  return (
    <JobSeekerLayout activeMenu="/jobseeker-apply-save-job">
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Jobs & Applications
            </h1>
            <p className="mt-2 text-gray-600">
              Discover opportunities and manage your applications
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mb-8 rounded-xl bg-white p-6 shadow-lg">
            <div className="flex flex-col gap-4 md:flex-row">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs, companies, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-3 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Filter */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterType("all")}
                  className={`rounded-lg px-4 py-3 font-medium transition-colors ${
                    filterType === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All Jobs
                </button>
                <button
                  onClick={() => setFilterType("applied")}
                  className={`rounded-lg px-4 py-3 font-medium transition-colors ${
                    filterType === "applied"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Applied
                </button>
                <button
                  onClick={() => setFilterType("saved")}
                  className={`rounded-lg px-4 py-3 font-medium transition-colors ${
                    filterType === "saved"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Saved
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {jobs.length}
                  </p>
                  <p className="text-gray-600">Applied Jobs</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <Send className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {savedJobs.length}
                  </p>
                  <p className="text-gray-600">Saved Jobs</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                  <Bookmark className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Jobs Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => {
              return (
                <div
                  key={job.job_id}
                  className="rounded-xl bg-white shadow-lg transition-shadow hover:shadow-xl"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex flex-1 items-start space-x-3">
                        <img
                          src={
                            job.employer_logo ||
                            job.employer?.logo ||
                            "/Logo_SkillSync_BR.png"
                          }
                          alt={`${job.company_name} logo`}
                          className="h-12 w-12 flex-shrink-0 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="mb-1 text-lg font-semibold text-gray-900">
                            {job.title}
                          </h3>
                          <div className="mb-2 flex items-center text-gray-600">
                            <Building2 className="mr-1 h-4 w-4" />
                            <span className="text-sm">{job.company_name}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="mr-1 h-4 w-4" />
                            <span>{job.location}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      {job.application_status && (
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(job.application_status)}`}
                        >
                          {job.application_status}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="mb-4 line-clamp-3 text-sm text-gray-600">
                      {job.description}
                    </p>

                    {/* Tags */}
                    <div className="mb-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        {job.job_type?.replace("_", " ") || "Full Time"}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        {formatSalary(job.min_salary, job.max_salary)}
                      </span>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="mr-1 h-4 w-4" />
                        <span>
                          Applied{" "}
                          {formatTimeAgo(job.applied_at || job.posted_at)}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            /* TODO: Implement job details modal */
                          }}
                          className="p-2 text-gray-400 transition-colors hover:text-gray-600"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleSaveJob(job.job_id)}
                          className={`p-2 transition-colors ${
                            job.is_saved
                              ? "text-red-500 hover:text-red-600"
                              : "text-gray-400 hover:text-gray-600"
                          }`}
                          title={
                            job.is_saved ? "Remove from Saved" : "Save Job"
                          }
                        >
                          {job.is_saved ? (
                            <BookmarkCheck className="h-4 w-4" />
                          ) : (
                            <Bookmark className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Applied Status */}
                    <div className="mt-4">
                      <div className="w-full rounded-lg bg-green-100 px-4 py-2 text-center font-medium text-green-700">
                        ✓ Applied
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredJobs.length === 0 && (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
                <BriefcaseBusiness className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                {filterType === "applied"
                  ? "No applied jobs"
                  : filterType === "saved"
                    ? "No saved jobs"
                    : "No jobs found"}
              </h3>
              <p className="text-gray-500">
                {filterType === "applied"
                  ? "You haven't applied to any jobs yet"
                  : filterType === "saved"
                    ? "You haven't saved any jobs yet"
                    : searchTerm
                      ? "Try adjusting your search terms"
                      : "No jobs available at the moment"}
              </p>
            </div>
          )}
        </div>
      </div>
    </JobSeekerLayout>
  );
};

export default ApplicationSavedJob;
