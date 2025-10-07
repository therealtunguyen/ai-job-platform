import { supabase } from "../../supabaseClient";
import { Database } from "../../types/supabase";

type ApplicationRow = Database["public"]["Tables"]["applications"]["Row"];
type ApplicationInsert = Database["public"]["Tables"]["applications"]["Insert"];
type ApplicationUpdate = Database["public"]["Tables"]["applications"]["Update"];

// Function to create an application with validation
export const createAppWithValidation = async (
    applicationData: Omit<
        ApplicationInsert,
        "application_id" | "applied_at" | "status_updated_at"
    >,
    userId: string,
) => {
    // Verify that the authenticated user is the candidate
    if (applicationData.candidate_id !== userId) {
        throw new Error(
            "Unauthorized: You can only submit applications for yourself",
        );
    }

    // Verify that the user is a job seeker
    const { data: userProfile, error: profileError } = await supabase
        .from("user_profiles")
        .select("user_type")
        .eq("user_id", userId)
        .single();

    if (
        profileError ||
        !userProfile ||
        userProfile.user_type !== "JOB_SEEKER"
    ) {
        throw new Error("Only job seekers can submit applications");
    }

    // Check if job exists
    const { data: job, error: jobError } = await supabase
        .from("jobs")
        .select("job_id, applicant_count")
        .eq("job_id", applicationData.job_id)
        .single();

    if (jobError || !job) {
        throw new Error("Job not found");
    }

    // Check if the candidate exists (they should if they're authenticated)
    const { data: jobSeeker, error: seekerError } = await supabase
        .from("job_seekers")
        .select("user_id")
        .eq("user_id", applicationData.candidate_id)
        .single();

    if (seekerError || !jobSeeker) {
        throw new Error("Candidate not found");
    }

    // Check if an application already exists for this candidate and job
    const { data: existingApplication, error: existingError } = await supabase
        .from("applications")
        .select("application_id")
        .eq("job_id", applicationData.job_id)
        .eq("candidate_id", applicationData.candidate_id)
        .single();

    if (existingApplication) {
        throw new Error(
            "Application already exists for this job and candidate",
        );
    }

    // Create the application
    const newApplication: ApplicationInsert = {
        ...applicationData,
        status: applicationData.status || "SUBMITTED",
        applied_at: new Date().toISOString(),
        status_updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
        .from("applications")
        .insert([newApplication])
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to create application: ${error.message}`);
    }

    // Increment the applicant count for the job
    // First get the current applicant count
    const { data: jobForUpdate, error: jobFetchError } = await supabase
        .from("jobs")
        .select("applicant_count")
        .eq("job_id", applicationData.job_id)
        .single();

    if (!jobFetchError && jobForUpdate) {
        const newApplicantCount = (jobForUpdate.applicant_count || 0) + 1;
        const { error: updateError } = await supabase
            .from("jobs")
            .update({ applicant_count: newApplicantCount })
            .eq("job_id", applicationData.job_id);

        if (updateError) {
            console.error("Error updating job applicant count:", updateError);
            // NOTE: This is not ideal as we have a created application but couldn't update job count
            // In a production system, you'd want to use database transactions
        }
    }

    return data as ApplicationRow;
};

// Function to get application status based on application ID
export const getApplicationStatus = async (applicationId: string) => {
    const { data, error } = await supabase
        .from("applications")
        .select("application_id, status, applied_at, status_updated_at")
        .eq("application_id", applicationId)
        .single();

    if (error) {
        throw new Error(`Failed to retrieve application: ${error.message}`);
    }

    if (!data) {
        throw new Error("Application not found");
    }

    return data;
};

// Function to update application status
export const updateApplicationStatus = async (
    applicationId: string,
    status: Database["public"]["Enums"]["application_status_enum"],
) => {
    const { data, error } = await supabase
        .from("applications")
        .update({
            status,
            status_updated_at: new Date().toISOString(),
        })
        .eq("application_id", applicationId)
        .select()
        .single();

    if (error) {
        throw new Error(
            `Failed to update application status: ${error.message}`,
        );
    }

    return data;
};

// Function to list all applications of current user
export const listUserApplications = async (userId: string) => {
    const { data, error } = await supabase
        .from("applications")
        .select(
            `
      application_id,
      applied_at,
      status,
      status_updated_at,
      job_id,
      jobs(title)
    `,
        )
        .eq("candidate_id", userId)
        .order("applied_at", { ascending: false });

    if (error) {
        throw new Error(
            `Failed to retrieve user applications: ${error.message}`,
        );
    }

    return data;
};

// Function to list all applications for an employer's jobs
export const listJobApplications = async (employerId: string) => {
    // First get the job IDs for the employer
    const { data: jobIds, error: jobError } = await supabase
        .from("jobs")
        .select("job_id")
        .eq("employer_id", employerId);

    if (jobError) {
        throw new Error(`Failed to retrieve job IDs: ${jobError.message}`);
    }

    if (!jobIds || jobIds.length === 0) {
        return []; // Return empty array if the employer has no jobs
    }

    // Extract job IDs to use in the IN clause
    const jobIdsArray = jobIds.map((job) => job.job_id);

    const { data, error } = await supabase
        .from("applications")
        .select(
            `
      application_id,
      applied_at,
      status,
      status_updated_at,
      candidate_id,
      job_id,
      jobs(title),
      job_seekers(full_name, phone)
    `,
        )
        .in("job_id", jobIdsArray)
        .order("applied_at", { ascending: false });

    if (error) {
        throw new Error(
            `Failed to retrieve job applications: ${error.message}`,
        );
    }

    return data;
};

// Function to list all applications for a specific job
export const listApplicationsForJob = async (
    jobId: string,
    employerId: string,
) => {
    // First verify that the job belongs to the employer
    const { data: job, error: jobError } = await supabase
        .from("jobs")
        .select("job_id, employer_id")
        .eq("job_id", jobId)
        .eq("employer_id", employerId)
        .single();

    if (jobError || !job) {
        throw new Error("Job not found or does not belong to employer");
    }

    const { data, error } = await supabase
        .from("applications")
        .select(
            `
      application_id,
      applied_at,
      status,
      status_updated_at,
      candidate_id,
      job_seekers(full_name, phone)
    `,
        )
        .eq("job_id", jobId)
        .order("applied_at", { ascending: false });

    if (error) {
        throw new Error(
            `Failed to retrieve job applications: ${error.message}`,
        );
    }

    return data;
};

// Function to get a complete application by ID for authorized users
export const getApplicationById = async (
    applicationId: string,
    userId: string,
) => {
    // Get the application with associated job and candidate information
    const { data: application, error } = await supabase
        .from("applications")
        .select(
            `
            application_id,
            applied_at,
            status,
            status_updated_at,
            candidate_id,
            job_id
        `,
        )
        .eq("application_id", applicationId)
        .single();

    if (error) {
        throw new Error(`Failed to retrieve application: ${error.message}`);
    }

    if (!application) {
        throw new Error("Application not found");
    }

    // Check if the user is the candidate who submitted the application
    const isCandidate = application.candidate_id === userId;

    // Check if user is the employer who posted the job by querying the jobs table separately
    let isEmployer = false;
    if (!isCandidate) {
        const { data: jobData, error: jobError } = await supabase
            .from("jobs")
            .select("employer_id")
            .eq("job_id", application.job_id)
            .eq("employer_id", userId)
            .single();

        isEmployer = !jobError && jobData && jobData.employer_id === userId;
    }

    if (!isCandidate && !isEmployer) {
        throw new Error(
            "Access denied. You can only view your own applications or applications to your jobs.",
        );
    }

    // If the user is the employer, return application with more candidate details
    if (isEmployer) {
        const { data: fullApplication, error: fullAppError } = await supabase
            .from("applications")
            .select(
                `
                application_id,
                applied_at,
                status,
                status_updated_at,
                candidate_id,
                job_id,
                jobs(title, description),
                job_seekers(full_name, email, phone, summary)
            `,
            )
            .eq("application_id", applicationId)
            .single();

        if (fullAppError) {
            throw new Error(
                `Failed to retrieve complete application: ${fullAppError.message}`,
            );
        }

        return fullApplication;
    } else {
        // If the user is the candidate, return application data without sensitive employer details
        const { data: candidateApplication, error: candidateAppError } =
            await supabase
                .from("applications")
                .select(
                    `
                application_id,
                applied_at,
                status,
                status_updated_at,
                candidate_id,
                job_id,
                jobs(title, description)
            `,
                )
                .eq("application_id", applicationId)
                .single();

        if (candidateAppError) {
            throw new Error(
                `Failed to retrieve application: ${candidateAppError.message}`,
            );
        }

        return candidateApplication;
    }
};

// Function to verify if an employer can access a specific application
export const employerCanAccessApp = async (
    applicationId: string,
    employerId: string,
) => {
    const { data, error } = await supabase
        .from("applications")
        .select("job_id, jobs(employer_id)")
        .eq("application_id", applicationId)
        .eq("jobs.employer_id", employerId)
        .single();

    return { canAccess: !error && data, error };
};

// Function to verify if a user can access their own application
export const userCanAccessApp = async (
    applicationId: string,
    userId: string,
) => {
    const { data, error } = await supabase
        .from("applications")
        .select("application_id")
        .eq("application_id", applicationId)
        .eq("candidate_id", userId)
        .single();

    return { canAccess: !error && data, error };
};
