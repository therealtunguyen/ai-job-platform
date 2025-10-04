import { supabase } from "../../supabaseClient";
import { Tables, TablesInsert, TablesUpdate } from "../../types/supabase";
import type { PostgrestError } from "@supabase/supabase-js";

type Job = Tables<"jobs">;
type CreateJobDTO = TablesInsert<"jobs">;
type UpdateJobDTO = TablesUpdate<"jobs">;

const TABLE = "jobs";

export async function createNewJob(payload: CreateJobDTO): Promise<Job> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select()
    .single<Job>();
  if (error) throw error;
  return data;
}

export async function listJobs(limit = 50, offset = 0): Promise<Job[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("posted_at", { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return data ?? [];
}

export async function getJobById(id: string): Promise<Job | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("job_id", id)
    .single<Job>();
  if (error) {
    if (isNoRowsError(error)) {
      return null;
    }
    throw error;
  }
  return data;
}

export async function updateJob(id: string, updates: UpdateJobDTO): Promise<Job | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...updates })
    .eq("job_id", id)
    .select()
    .single<Job>();
  if (error) {
    if (isNoRowsError(error)) return null;
    throw error;
  }
  return data;
}

export async function deleteJob(id: string): Promise<boolean> {
  const { error, count } = await supabase
    .from(TABLE)
    .delete({ count: "exact" })
    .eq("job_id", id);
  if (error) throw error;
  return (count ?? 0) > 0;
}



// ---- Internal helpers ----
function isNoRowsError(err: unknown): boolean {
  if (!err) return false;
  const e = err as Partial<PostgrestError> & { message?: string };
  return e.code === "PGRST116" || !!e.message?.includes("0 rows");
}

