import { supabase } from "../../supabaseClient";
import { Tables, TablesInsert, TablesUpdate } from "../../types/supabase";
import type { PostgrestError } from "@supabase/supabase-js";

type Job = Tables<"jobs">;
type Employer = Tables<"employers">;
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

// ---- Internal helpers ----
function isNoRowsError(err: unknown): boolean {
  if (!err) return false;
  const e = err as Partial<PostgrestError> & { message?: string };
  return e.code === "PGRST116" || !!e.message?.includes("0 rows");
}
