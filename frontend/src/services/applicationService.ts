import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPath";
import type { Tables } from "@/types/supabase";

// Define application type based on the database schema
export type Application = Tables<"applications"> & {
  job: Tables<"jobs">;
  job_seekers: Tables<"job_seekers"> & {
    email?: string; // Email might come from user_profiles table
  };
  resume?: Tables<"cvs">;
};

// Define possible application statuses
export type ApplicationStatus = Tables<"applications">["status"];

// Service for managing applications
export const applicationService = {
  /**
   * Get all applications for a specific job
   */
  getApplicationsByJob: async (jobId: string): Promise<Application[]> => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.APPLICATIONS.GET_JOB_APPLICATIONS.replace(":jobId", jobId),
      );
      return response.data.applications || response.data;
    } catch (error) {
      console.error("Error fetching applications:", error);
      throw error;
    }
  },

  /**
   * Get all applications for an employer
   */
  getApplicationsByEmployer: async (
    employerId: string,
  ): Promise<Application[]> => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.APPLICATIONS.GET_EMPLOYER_APPLICATIONS.replace(
          ":employerId",
          employerId,
        ),
      );
      return response.data.applications || response.data;
    } catch (error) {
      console.error("Error fetching employer applications:", error);
      throw error;
    }
  },

  /**
   * Update application status
   */
  updateApplicationStatus: async (
    applicationId: string,
    status: ApplicationStatus,
  ): Promise<Application> => {
    try {
      const response = await axiosInstance.patch(
        API_PATHS.APPLICATIONS.UPDATE_STATUS.replace(":id", applicationId),
        { status },
      );
      return response.data.application;
    } catch (error) {
      console.error("Error updating application status:", error);
      throw error;
    }
  },

  /**
   * Get application by ID
   */
  getApplicationById: async (applicationId: string): Promise<Application> => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.APPLICATIONS.GET_BY_ID.replace(":id", applicationId),
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching application:", error);
      throw error;
    }
  },
};
