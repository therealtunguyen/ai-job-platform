import { useEffect, useState } from "react";
import JobCard from "../../pages/Employer/JobCard";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPath";

const FeatureJob = () => {
  const [loading, setLoading] = useState(false);
  type Job = {
    job_id: string;
    title: string;
    description?: string;
    company_name?: string;
    employer_company_name?: string;
    location?: string;
    min_salary?: number | null;
    max_salary?: number | null;
    min_experience?: number | null;
    max_experience?: number | null;
    posted_at?: string;
    created_at?: string;
    updated_at?: string;
    job_type?: string;
    company_type?: string;
    employer_logo?: string;
    employer?: {
      logo?: string;
      company_name?: string;
    };
  };

  const [jobs, setJobs] = useState<Job[]>([]);

  const formatTimeAgo = (iso?: string) => {
    if (!iso) return "";
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return "";
    const diffMs = Date.now() - then;
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  const formatSalary = (min?: number | null, max?: number | null) => {
    const normalize = (v?: number | null) => (v && v > 0 ? v : undefined);
    const nMin = normalize(min);
    const nMax = normalize(max);
    const toK = (v: number) => {
      if (v >= 1000) {
        const k = v / 1000;
        const rounded = Math.round(k * 10) / 10;
        return `$${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded}k`;
      }
      return `$${v}`;
    };
    if (nMin && nMax) return `${toK(nMin)} - ${toK(nMax)}`;
    if (nMin && !nMax) return `${toK(nMin)}+`;
    if (!nMin && nMax) return `Up to ${toK(nMax)}`;
    return "Salary not specified";
  };

  const formatExperience = (min?: number | null, max?: number | null) => {
    const nMin = typeof min === "number" && min >= 0 ? min : undefined;
    const nMax = typeof max === "number" && max >= 0 ? max : undefined;
    if (nMin != null && nMax != null) return `${nMin}–${nMax} yrs`;
    if (nMin != null) return `${nMin}+ yrs`;
    if (nMax != null) return `Up to ${nMax} yrs`;
    return undefined;
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(API_PATHS.JOBS.LIST);
        const jobsData = response?.data?.data || response?.data || [];
        // Limit to 4 jobs for featured section
        const limitedJobs = Array.isArray(jobsData) ? jobsData.slice(0, 4) : [];
        setJobs(limitedJobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const navigate = useNavigate();
  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900">
            Featured Jobs
          </h2>
          <p className="text-lg text-gray-600">
            Know your worth and find the job that qualifies your life
          </p>
        </div>

        {/* Job Cards Grid */}
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2">
          {loading
            ? // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="h-6 w-8 rounded bg-gray-200"></div>
                      <div className="h-6 w-16 rounded bg-gray-200"></div>
                    </div>
                    <div className="mb-2 h-6 w-3/4 rounded bg-gray-200"></div>
                    <div className="mb-4 h-4 w-1/2 rounded bg-gray-200"></div>
                    <div className="mb-4 flex gap-2">
                      <div className="h-6 w-16 rounded bg-gray-200"></div>
                      <div className="h-6 w-16 rounded bg-gray-200"></div>
                    </div>
                  </div>
                </div>
              ))
            : jobs.map((job, index) => {
                const salaryLabel = formatSalary(
                  job.min_salary,
                  job.max_salary,
                );
                const experience = formatExperience(
                  job.min_experience,
                  job.max_experience,
                );
                const posted =
                  job.posted_at || job.created_at || job.updated_at;
                return (
                  <JobCard
                    key={job.job_id || index}
                    title={job.title}
                    company={
                      job.company_name || job.employer_company_name || ""
                    }
                    location={job.location || ""}
                    timeAgo={formatTimeAgo(posted)}
                    salary={salaryLabel}
                    jobType={job.job_type || "Full Time"}
                    companyType={job.company_type || "Private"}
                    experience={experience}
                    companyLogo={
                      job.employer_logo ||
                      job.employer?.logo ||
                      "/Logo_SkillSync_BR.png"
                    }
                  />
                );
              })}
          {!loading && jobs.length === 0 && (
            <div className="col-span-1 text-center text-gray-500 md:col-span-2">
              No jobs found.
            </div>
          )}
        </div>

        {/* Load More Button */}
        <div className="mt-12 text-center">
          <button
            className="cursor-pointer rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
            onClick={() => {
              navigate("/find-jobs");
            }}
          >
            Load More Listings
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeatureJob;
