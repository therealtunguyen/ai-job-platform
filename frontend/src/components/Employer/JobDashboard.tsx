import { useState, useEffect } from "react";
import type { Job as JobType } from "@/services/jobService";
import JobCard from "./JobCard";
import { jobService } from "@/services/jobService";

const JobDashboard = () => {
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobType[]>([]);
  const [activeTab, setActiveTab] = useState<
    "all" | "active" | "drafts" | "paused" | "archived"
  >("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, activeTab]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const employerJobs = await jobService.getJobsByEmployer();
      setJobs(employerJobs);
      setError(null);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to load jobs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let result: JobType[];

    switch (activeTab) {
      case "active":
        result = jobs.filter((job) => job.status === "ACTIVE");
        break;
      case "drafts":
        result = jobs.filter((job) => job.status === "DRAFT");
        break;
      case "paused":
        result = jobs.filter((job) => job.status === "PAUSED");
        break;
      case "archived":
        result = jobs.filter((job) => job.status === "ARCHIVED");
        break;
      default:
        result = jobs;
    }

    setFilteredJobs(result);
  };

  const handleJobUpdate = (updatedJob: JobType) => {
    setJobs((prev) =>
      prev.map((job) => (job.job_id === updatedJob.job_id ? updatedJob : job)),
    );
  };

  const tabCounts = {
    all: jobs.length,
    active: jobs.filter((job) => job.status === "ACTIVE").length,
    drafts: jobs.filter((job) => job.status === "DRAFT").length,
    paused: jobs.filter((job) => job.status === "PAUSED").length,
    archived: jobs.filter((job) => job.status === "ARCHIVED").length,
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Job Dashboard</h1>
        <p className="text-gray-600">Manage your job postings</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {(["all", "active", "drafts", "paused", "archived"] as const).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap ${
                    activeTab === tab
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  <span
                    className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                      activeTab === tab
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {tabCounts[tab]}
                  </span>
                </button>
              ),
            )}
          </nav>
        </div>
      </div>

      <div className="mb-6">
        <a
          href="/job-posting"
          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          + Create New Job
        </a>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-gray-500">
            {activeTab === "all"
              ? "No jobs found. Create your first job posting!"
              : `No ${activeTab} jobs found.`}
          </p>
          {activeTab !== "all" && (
            <button
              onClick={() => setActiveTab("all")}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              View all jobs
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job) => (
            <JobCard key={job.job_id} job={job} onJobUpdate={handleJobUpdate} />
          ))}
        </div>
      )}
    </div>
  );
};

export default JobDashboard;
