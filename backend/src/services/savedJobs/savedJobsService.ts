import { supabase } from "../../supabaseClient";
import { Database } from "../../types/supabase";

type SavedJobRow = Database["public"]["Tables"]["saved_jobs"]["Row"];
type SavedJobInsert = Database["public"]["Tables"]["saved_jobs"]["Insert"];

// Define type for saved job with job details
type SavedJobWithDetails = SavedJobRow & {
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
};

/**
 * Save a job for a job seeker
 * @param userId - The authenticated user's ID
 * @param jobId - The job ID to save
 * @param notes - Optional notes about the saved job
 */
export const saveJob = async (
  userId: string,
  jobId: string,
  notes?: string,
): Promise<SavedJobRow> => {
  // Verify that the user is a job seeker
  const { data: userProfile, error: profileError } = await supabase
    .from("user_profiles")
    .select("user_type")
    .eq("user_id", userId)
    .single();

  if (profileError || !userProfile || userProfile.user_type !== "JOB_SEEKER") {
    throw new Error("Only job seekers can save jobs");
  }

  // Check if job exists
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("job_id")
    .eq("job_id", jobId)
    .single();

  if (jobError || !job) {
    throw new Error("Job not found");
  }

  // Check if the job is already saved
  const { data: existingSavedJob } = await supabase
    .from("saved_jobs")
    .select("saved_job_id")
    .eq("job_seeker_id", userId)
    .eq("job_id", jobId)
    .maybeSingle();

  if (existingSavedJob) {
    throw new Error("Job already saved");
  }

  // Create the saved job entry
  const newSavedJob: SavedJobInsert = {
    job_seeker_id: userId,
    job_id: jobId,
    notes: notes || null,
    saved_at: new Date().toISOString(),
  };

  const { data: savedJobData, error: saveError } = await supabase
    .from("saved_jobs")
    .insert([newSavedJob])
    .select()
    .single();

  if (saveError) {
    throw new Error(`Failed to save job: ${saveError.message}`);
  }

  return savedJobData;
};

/**
 * Unsave (remove) a saved job
 * @param userId - The authenticated user's ID
 * @param jobId - The job ID to unsave
 */
export const unsaveJob = async (
  userId: string,
  jobId: string,
): Promise<void> => {
  // Verify that the user is a job seeker
  const { data: userProfile, error: profileError } = await supabase
    .from("user_profiles")
    .select("user_type")
    .eq("user_id", userId)
    .single();

  if (profileError || !userProfile || userProfile.user_type !== "JOB_SEEKER") {
    throw new Error("Only job seekers can unsave jobs");
  }

  // Check if the saved job exists
  const { data: existingSavedJob } = await supabase
    .from("saved_jobs")
    .select("saved_job_id")
    .eq("job_seeker_id", userId)
    .eq("job_id", jobId)
    .maybeSingle();

  if (!existingSavedJob) {
    throw new Error("Saved job not found");
  }

  // Delete the saved job
  const { error: deleteError } = await supabase
    .from("saved_jobs")
    .delete()
    .eq("job_seeker_id", userId)
    .eq("job_id", jobId);

  if (deleteError) {
    throw new Error(`Failed to unsave job: ${deleteError.message}`);
  }
};

/**
 * Get all saved jobs for a user with job details
 * @param userId - The authenticated user's ID
 */
export const getSavedJobs = async (
  userId: string,
): Promise<SavedJobWithDetails[]> => {
  // Verify that the user is a job seeker
  const { data: userProfile, error: profileError } = await supabase
    .from("user_profiles")
    .select("user_type")
    .eq("user_id", userId)
    .single();

  if (profileError || !userProfile || userProfile.user_type !== "JOB_SEEKER") {
    throw new Error("Only job seekers can view saved jobs");
  }

  const { data, error } = await supabase
    .from("saved_jobs")
    .select(
      `
      saved_job_id,
      job_seeker_id,
      job_id,
      saved_at,
      notes,
      job:jobs!saved_jobs_job_id_fkey (
        job_id,
        title,
        location,
        min_salary,
        max_salary,
        job_type,
        description,
        posted_at,
        employer:employer_id (logo, company_name)
      )
    `,
    )
    .eq("job_seeker_id", userId)
    .order("saved_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to retrieve saved jobs: ${error.message}`);
  }

  // Transform the data to flatten employer information
  const transformedData = data.map((savedJob: any) => ({
    ...savedJob,
    job: savedJob.job
      ? {
          ...savedJob.job,
          employer_logo: savedJob.job.employer?.logo || null,
          employer_company_name: savedJob.job.employer?.company_name || null,
          employer: undefined, // Remove the nested employer object
        }
      : null,
  }));

  return transformedData;
};

/**
 * Check if a specific job is saved by the user
 * @param userId - The authenticated user's ID
 * @param jobId - The job ID to check
 */
export const checkIfJobSaved = async (
  userId: string,
  jobId: string,
): Promise<{ isSaved: boolean; savedJobId?: string }> => {
  const { data, error } = await supabase
    .from("saved_jobs")
    .select("saved_job_id")
    .eq("job_seeker_id", userId)
    .eq("job_id", jobId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to check saved status: ${error.message}`);
  }

  return {
    isSaved: !!data,
    savedJobId: data?.saved_job_id,
  };
};

/**
 * Update notes for a saved job
 * @param userId - The authenticated user's ID
 * @param jobId - The job ID
 * @param notes - The updated notes
 */
export const updateSavedJobNotes = async (
  userId: string,
  jobId: string,
  notes: string,
): Promise<SavedJobRow> => {
  // Verify ownership
  const { data: existingSavedJob, error: existingError } = await supabase
    .from("saved_jobs")
    .select("saved_job_id")
    .eq("job_seeker_id", userId)
    .eq("job_id", jobId)
    .single();

  if (existingError || !existingSavedJob) {
    throw new Error("Saved job not found");
  }

  const { data, error } = await supabase
    .from("saved_jobs")
    .update({ notes })
    .eq("job_seeker_id", userId)
    .eq("job_id", jobId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update notes: ${error.message}`);
  }

  return data;
};
