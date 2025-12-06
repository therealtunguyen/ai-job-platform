import { supabase } from "../../supabaseClient";
import { Tables, TablesInsert, TablesUpdate } from "../../types/supabase";
import type { PostgrestError } from "@supabase/supabase-js";

type Job = Tables<"jobs">;
type CreateJobDTO = TablesInsert<"jobs">;
type UpdateJobDTO = TablesUpdate<"jobs">;

// Define type for job with employer information
type JobWithEmployer = Job & {
  employer_logo: string | null;
  employer_company_name: string | null;
};

const TABLE = "jobs";

export async function createNewJob(
  payload: CreateJobDTO,
): Promise<JobWithEmployer> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select(
      `
      *,
      employer:employer_id (logo, company_name)
    `,
    )
    .single();
  if (error) throw error;

  if (!data) throw new Error("Failed to create job");

  return {
    ...data,
    employer_logo: data.employer?.logo || null,
    employer_company_name: data.employer?.company_name || null,
  };
}

export async function listJobs(
  limit = 50,
  offset = 0,
): Promise<JobWithEmployer[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(
      `
      *,
      employer:employer_id (logo, company_name)
    `,
    )
    .order("posted_at", { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;

  // Transform the data to flatten employer information
  const jobsWithEmployer: JobWithEmployer[] = (data ?? []).map((job: any) => ({
    ...job,
    employer_logo: job.employer?.logo || null,
    employer_company_name: job.employer?.company_name || null,
  }));

  return jobsWithEmployer;
}

export async function getJobById(id: string): Promise<JobWithEmployer | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(
      `
      *,
      employer:employer_id (logo, company_name)
    `,
    )
    .eq("job_id", id)
    .single();
  if (error) {
    if (isNoRowsError(error)) {
      return null;
    }
    throw error;
  }

  if (!data) return null;

  return {
    ...data,
    employer_logo: data.employer?.logo || null,
    employer_company_name: data.employer?.company_name || null,
  };
}

export async function updateJob(
  id: string,
  updates: UpdateJobDTO,
  employerId: string,
): Promise<JobWithEmployer | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...updates })
    .eq("job_id", id)
    .eq("employer_id", employerId)
    .select(
      `
      *,
      employer:employer_id (logo, company_name)
    `,
    )
    .single();
  if (error) {
    if (isNoRowsError(error)) return null;
    throw error;
  }

  if (!data) return null;

  return {
    ...data,
    employer_logo: data.employer?.logo || null,
    employer_company_name: data.employer?.company_name || null,
  };
}

export async function deleteJob(
  id: string,
  employerId: string,
): Promise<boolean> {
  const { error, count } = await supabase
    .from(TABLE)
    .delete({ count: "exact" })
    .eq("job_id", id)
    .eq("employer_id", employerId);
  if (error) throw error;
  return (count ?? 0) > 0;
}

export async function getJobsByEmployerId(
  employerId: string,
  limit = 50,
  offset = 0,
): Promise<JobWithEmployer[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(
      `
      *,
      employer:employer_id (logo, company_name)
    `,
    )
    .eq("employer_id", employerId)
    .order("last_updated_at", { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;

  // Transform the data to flatten employer information
  const jobsWithEmployer: JobWithEmployer[] = (data ?? []).map((job: any) => ({
    ...job,
    employer_logo: job.employer?.logo || null,
    employer_company_name: job.employer?.company_name || null,
  }));

  return jobsWithEmployer;
}

export async function filterJobs(filters: {
  title?: string;
  location?: string;
  job_type?: string;
  min_salary?: number;
  max_salary?: number;
  min_experience?: number;
  max_experience?: number;
  status?: string;
  posted_after?: string;
  limit?: number;
  offset?: number;
  excludeAppliedByUser?: string; // User ID to exclude jobs they've applied to
}): Promise<JobWithEmployer[]> {
  // If we need to exclude jobs the user has applied to, fetch those job IDs first
  let appliedJobIds: string[] = [];
  if (filters.excludeAppliedByUser) {
    const { data: applications, error: appError } = await supabase
      .from("applications")
      .select("job_id")
      .eq("candidate_id", filters.excludeAppliedByUser);

    if (appError) {
      console.error("Error fetching user applications:", appError);
      // Continue without filtering if there's an error
    } else {
      appliedJobIds = (applications ?? []).map((app) => app.job_id);
    }
  }

  let query = supabase
    .from(TABLE)
    .select(
      `
      *,
      employer:employer_id (logo, company_name)
    `,
    )
    .order("posted_at", { ascending: false, nullsFirst: false });

  // Exclude jobs the user has already applied to
  if (appliedJobIds.length > 0) {
    query = query.not("job_id", "in", `(${appliedJobIds.join(",")})`);
  }

  // Apply filters
  if (filters.title) {
    query = query.ilike("title", `%${filters.title}%`);
  }

  if (filters.location) {
    query = query.ilike("location", `%${filters.location}%`);
  }

  if (filters.job_type) {
    query = query.eq("job_type", filters.job_type);
  }

  if (filters.min_salary !== undefined) {
    query = query.gte("min_salary", filters.min_salary);
  }

  if (filters.max_salary !== undefined) {
    query = query.lte("max_salary", filters.max_salary);
  }

  if (filters.min_experience !== undefined) {
    query = query.gte("min_experience", filters.min_experience);
  }

  if (filters.max_experience !== undefined) {
    query = query.lte("max_experience", filters.max_experience);
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.posted_after) {
    query = query.gte("posted_at", filters.posted_after);
  }

  // Apply pagination
  const limit = filters.limit || 50;
  const offset = filters.offset || 0;
  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;
  if (error) throw error;

  // Transform the data to flatten employer information
  const jobsWithEmployer: JobWithEmployer[] = (data ?? []).map((job: any) => ({
    ...job,
    employer_logo: job.employer?.logo || null,
    employer_company_name: job.employer?.company_name || null,
  }));

  return jobsWithEmployer;
}

// ---- Internal helpers ----
function isNoRowsError(err: unknown): boolean {
  if (!err) return false;
  const e = err as Partial<PostgrestError> & { message?: string };
  return e.code === "PGRST116" || !!e.message?.includes("0 rows");
}
