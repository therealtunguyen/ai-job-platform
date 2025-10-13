import { supabase } from "../../supabaseClient";

// Types for job seeker profile update
export interface UpdateJobSeekerProfileData {
  full_name?: string;
  phone?: string;
  address?: string;
  preferred_location?: string;
  expected_salary?: number;
  summary?: string;
  status?: "INCOMPLETE" | "COMPLETE" | "VERIFIED" | "SUSPENDED";
}

// Types for employer profile update
export interface UpdateEmployerProfileData {
  company_name?: string;
  contact_person?: string;
  phone?: string;
  address?: string;
  description?: string;
  industry?: string;
}

/**
 * Update job seeker profile
 * @param userId - The ID of the job seeker
 * @param profileData - The profile data to update
 * @returns Result with success status and optional error
 */
export const updateJobSeekerProfile = async (
  userId: string,
  profileData: UpdateJobSeekerProfileData,
) => {
  try {
    // Update the job seeker profile in the database
    const { data, error } = await supabase
      .from("job_seekers")
      .update({
        ...profileData,
        last_updated: new Date().toISOString(), // Update the last_updated timestamp
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating job seeker profile:", error);
      return {
        success: false,
        error: error.message || "Failed to update profile",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error("Error updating job seeker profile:", error);
    return {
      success: false,
      error: error.message || "Internal server error",
    };
  }
};

/**
 * Update employer profile
 * @param userId - The ID of the employer
 * @param profileData - The profile data to update
 * @returns Result with success status and optional error
 */
export const updateEmployerProfile = async (
  userId: string,
  profileData: UpdateEmployerProfileData,
) => {
  try {
    // Update the employer profile in the database
    const { data, error } = await supabase
      .from("employers")
      .update(profileData)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating employer profile:", error);
      return {
        success: false,
        error: error.message || "Failed to update profile",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error("Error updating employer profile:", error);
    return {
      success: false,
      error: error.message || "Internal server error",
    };
  }
};

/**
 * Get job seeker profile
 * @param userId - The ID of the job seeker
 * @returns Job seeker profile data
 */
export const getJobSeekerProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("job_seekers")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching job seeker profile:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch profile",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error("Error fetching job seeker profile:", error);
    return {
      success: false,
      error: error.message || "Internal server error",
    };
  }
};

/**
 * Get employer profile
 * @param userId - The ID of the employer
 * @returns Employer profile data
 */
export const getEmployerProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("employers")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching employer profile:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch profile",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error("Error fetching employer profile:", error);
    return {
      success: false,
      error: error.message || "Internal server error",
    };
  }
};
