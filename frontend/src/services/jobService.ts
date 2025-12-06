import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPath";

// Define the Job type based on the supabase schema
export interface Job {
  job_id: string;
  applicant_count: number | null;
  description: string | null;
  employer_id: string;
  expires_at: string | null;
  job_type:
    | "FULL_TIME"
    | "PART_TIME"
    | "CONTRACT"
    | "INTERNSHIP"
    | "TEMPORARY"
    | string
    | null;
  last_updated_at: string | null;
  location: string | null;
  max_experience: number | null;
  max_salary: number | null;
  min_experience: number | null;
  min_salary: number | null;
  posted_at: string | null;
  status:
    | "DRAFT"
    | "ACTIVE"
    | "PAUSED"
    | "EXPIRED"
    | "FILLED"
    | "ARCHIVED"
    | string
    | null;
  title: string;
  // Fields not in the database but needed
  benefits?: string | null;
  requirements?: string | null;
  responsibilities?: string | null;
}

// API service functions for job management
export const jobService = {
  // Get all jobs posted by the authenticated employer
  getJobsByEmployer: async (): Promise<Job[]> => {
    try {
      const response = await axiosInstance.get(API_PATHS.JOBS.GET_BY_EMPLOYER);
      // The backend returns data in the format { data: jobs, limit, offset }
      // so we access response.data.data for the jobs array
      return response.data.data;
    } catch (error) {
      console.error("Error fetching jobs by employer:", error);
      throw error;
    }
  },

  // Get a specific job by ID
  getJobById: async (jobId: string): Promise<Job> => {
    try {
      // Replace the :id placeholder with the actual job ID (as defined in API_PATHS)
      const url = API_PATHS.JOBS.GET_BY_ID.replace(":id", jobId);
      const response = await axiosInstance.get<Job>(url);
      return response.data;
    } catch (error) {
      console.error(`Error fetching job with ID ${jobId}:`, error);
      throw error;
    }
  },

  // Create a new job
  createJob: async (
    jobData: Omit<Job, "job_id" | "posted_at" | "applicant_count">,
  ): Promise<Job> => {
    try {
      const response = await axiosInstance.post<Job>(
        API_PATHS.JOBS.CREATE,
        jobData,
      );
      return response.data;
    } catch (error) {
      console.error("Error creating job:", error);
      throw error;
    }
  },

  // Update an existing job
  updateJob: async (jobId: string, jobData: Partial<Job>): Promise<Job> => {
    try {
      // Replace the :id placeholder with the actual job ID (as defined in API_PATHS)
      const url = API_PATHS.JOBS.UPDATE.replace(":id", jobId);
      const response = await axiosInstance.put<Job>(url, jobData);
      return response.data;
    } catch (error) {
      console.error(`Error updating job with ID ${jobId}:`, error);
      throw error;
    }
  },

  // Delete a job
  deleteJob: async (jobId: string): Promise<void> => {
    try {
      // Replace the :id placeholder with the actual job ID (as defined in API_PATHS)
      const url = API_PATHS.JOBS.DELETE.replace(":id", jobId);
      await axiosInstance.delete(url);
    } catch (error) {
      console.error(`Error deleting job with ID ${jobId}:`, error);
      throw error;
    }
  },
};
