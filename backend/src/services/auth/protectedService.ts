import { supabase } from "../../supabaseClient";

// Example service that requires authentication
export const getProtectedUserData = async (userId: string) => {
  try {
    // Example query that requires the user to be authenticated
    const { data, error } = await supabase
      .from("job_seekers")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error: any) {
    console.error("Error fetching protected user data:", error);
    throw error;
  }
};

// Example service for creating a job that requires employer authentication
export const createJobForEmployer = async (
  jobData: any,
  employerId: string,
) => {
  try {
    // Add the employer_id to the job data
    const jobWithEmployer = {
      ...jobData,
      employer_id: employerId,
    };

    const { data, error } = await supabase
      .from("jobs")
      .insert([jobWithEmployer])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error: any) {
    console.error("Error creating job:", error);
    throw error;
  }
};
