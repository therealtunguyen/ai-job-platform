import { useState, useEffect } from "react";
import type { Job as JobType } from "@/services/jobService";
import { jobService } from "@/services/jobService";

export const useJobOperations = () => {
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const createJob = async (
    jobData: Omit<JobType, "job_id" | "posted_at" | "applicant_count">,
  ) => {
    try {
      setLoading(true);
      const newJob = await jobService.createJob(jobData);
      setJobs((prev) => [...prev, newJob]);
      return newJob;
    } catch (err) {
      console.error("Error creating job:", err);
      setError("Failed to create job. Please try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateJob = async (jobId: string, updates: Partial<JobType>) => {
    try {
      setLoading(true);
      const updatedJob = await jobService.updateJob(jobId, updates);
      setJobs((prev) =>
        prev.map((job) => (job.job_id === jobId ? updatedJob : job)),
      );
      return updatedJob;
    } catch (err) {
      console.error("Error updating job:", err);
      setError("Failed to update job. Please try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (jobId: string) => {
    try {
      setLoading(true);
      await jobService.deleteJob(jobId);
      setJobs((prev) => prev.filter((job) => job.job_id !== jobId));
    } catch (err) {
      console.error("Error deleting job:", err);
      setError("Failed to delete job. Please try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return {
    jobs,
    loading,
    error,
    fetchJobs,
    createJob,
    updateJob,
    deleteJob,
  };
};
