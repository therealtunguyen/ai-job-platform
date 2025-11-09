import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPath";

// Define the SavedJob type based on the backend schema
export interface SavedJob {
  saved_job_id: string;
  job_seeker_id: string;
  job_id: string;
  saved_at: string | null;
  notes: string | null;
  job: {
    job_id: string;
    title: string;
    company_name: string | null;
    location: string | null;
    salary_min: number | null;
    salary_max: number | null;
    job_type: string | null;
    description: string | null;
    requirements: string | null;
    posted_at: string | null;
    employer_logo: string | null;
    employer_company_name: string | null;
  } | null;
}

export interface SaveJobRequest {
  job_id: string;
  notes?: string;
}

export interface UpdateNotesRequest {
  notes: string;
}

export interface SavedJobResponse {
  message: string;
  savedJob: {
    saved_job_id: string;
    job_seeker_id: string;
    job_id: string;
    saved_at: string | null;
    notes: string | null;
  };
}

export interface SavedJobsListResponse {
  message: string;
  savedJobs: SavedJob[];
  count: number;
}

export interface CheckSavedStatusResponse {
  message: string;
  isSaved: boolean;
  savedJobId?: string;
}

// API service functions for saved jobs management
export const savedJobsService = {
  /**
   * Get all saved jobs for the authenticated user
   */
  getSavedJobs: async (): Promise<SavedJob[]> => {
    try {
      const response = await axiosInstance.get<SavedJobsListResponse>(
        API_PATHS.SAVED_JOBS.LIST,
      );
      return response.data.savedJobs;
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
      throw error;
    }
  },

  /**
   * Save a job for the authenticated user
   * @param jobId - The ID of the job to save
   * @param notes - Optional notes about the saved job
   */
  saveJob: async (jobId: string, notes?: string): Promise<SavedJobResponse> => {
    try {
      const response = await axiosInstance.post<SavedJobResponse>(
        API_PATHS.SAVED_JOBS.SAVE,
        {
          job_id: jobId,
          notes: notes || undefined,
        },
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Error saving job:", error);
      // Re-throw with a more user-friendly message
      if (typeof error === "object" && error !== null && "response" in error) {
        const axiosError = error as {
          response?: { status?: number };
        };
        if (axiosError.response?.status === 409) {
          throw new Error("Job already saved");
        } else if (axiosError.response?.status === 404) {
          throw new Error("Job not found");
        } else if (axiosError.response?.status === 403) {
          throw new Error("Only job seekers can save jobs");
        }
      }
      throw error;
    }
  },

  /**
   * Unsave (remove) a saved job
   * @param jobId - The ID of the job to unsave
   */
  unsaveJob: async (jobId: string): Promise<void> => {
    try {
      const url = API_PATHS.SAVED_JOBS.UNSAVE.replace(":jobId", jobId);
      await axiosInstance.delete(url);
    } catch (error: unknown) {
      console.error("Error unsaving job:", error);
      if (typeof error === "object" && error !== null && "response" in error) {
        const axiosError = error as {
          response?: { status?: number };
        };
        if (axiosError.response?.status === 404) {
          throw new Error("Saved job not found");
        }
      }
      throw error;
    }
  },

  /**
   * Check if a specific job is saved by the user
   * @param jobId - The ID of the job to check
   */
  checkIfSaved: async (jobId: string): Promise<CheckSavedStatusResponse> => {
    try {
      const url = API_PATHS.SAVED_JOBS.CHECK.replace(":jobId", jobId);
      const response = await axiosInstance.get<CheckSavedStatusResponse>(url);
      return response.data;
    } catch (error) {
      console.error("Error checking saved status:", error);
      throw error;
    }
  },

  /**
   * Update notes for a saved job
   * @param jobId - The ID of the job
   * @param notes - The updated notes
   */
  updateNotes: async (
    jobId: string,
    notes: string,
  ): Promise<SavedJobResponse> => {
    try {
      const url = API_PATHS.SAVED_JOBS.UPDATE_NOTES.replace(":jobId", jobId);
      const response = await axiosInstance.patch<SavedJobResponse>(url, {
        notes,
      });
      return response.data;
    } catch (error: unknown) {
      console.error("Error updating notes:", error);
      if (typeof error === "object" && error !== null && "response" in error) {
        const axiosError = error as {
          response?: { status?: number };
        };
        if (axiosError.response?.status === 404) {
          throw new Error("Saved job not found");
        }
      }
      throw error;
    }
  },
};
