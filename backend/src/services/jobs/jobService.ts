import { supabase } from "../../supabaseClient"; // relative path adjusted via tsconfig baseUrl if needed
import { CreateJobDTO, Job, UpdateJobDTO } from "../../types/job";

const TABLE = "jobs"; // Ensure a jobs table exists in Supabase

export async function createNewJob(payload: CreateJobDTO): Promise<Job> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ ...payload })
    .select()
    .single<Job>();
  if (error) throw error;
  return data;
}

export async function listJobs(limit = 50, offset = 0): Promise<Job[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .range(offset, offset + limit - 1)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getJobById(id: string): Promise<Job | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single<Job>();
  if (error) {
    if ((error as any).code === "PGRST116" || error.message.includes("0 rows")) {
      return null;
    }
    throw error;
  }
  return data;
}

export async function updateJob(id: string, updates: UpdateJobDTO): Promise<Job | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single<Job>();
  if (error) {
    if (error.message.includes("0 rows")) return null;
    throw error;
  }
  return data;
}

export async function deleteJob(id: string): Promise<boolean> {
  const { error, count } = await supabase
    .from(TABLE)
    .delete({ count: "exact" })
    .eq("id", id);
  if (error) throw error;
  return (count ?? 0) > 0;
}

