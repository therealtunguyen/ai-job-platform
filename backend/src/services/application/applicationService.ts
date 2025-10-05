import { supabase } from "../../supabaseClient";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";

export type ApplicationPayload = {
  candidate_id?: string;
  candidate_name?: string;
  job_id: string;
  status?: string;
  applied_at?: string; // ISO string
  [key: string]: any;
};

// Placeholder for application tracking service
export const createApplication = async (payload: ApplicationPayload) => {
  if (!payload.job_id) throw new Error("Missing required field: job_id");
  if (!payload.candidate_id && !payload.candidate_name)
    throw new Error("Missing required field: candidate_id or candidate_name");

  const record = {
    ...payload,
    status: payload.status ? payload.status.toString().toLowerCase() : "submitted",
    applied_at: payload.applied_at ?? new Date().toISOString(),
  };

  const { data, error }: PostgrestSingleResponse<any> = await supabase
    .from("applications")
    .insert([record])
    .select()
    .single();

  if (error) throw new Error(error.message || "Failed to insert application");
  return data;
};

export const listApplicationsByEmployer = async (employer_id: string) => {
  if (!employer_id) throw new Error("Missing employer_id");

  const { data, error }: PostgrestSingleResponse<any[]> = await supabase
    .from("applications")
    .select("*")
    .eq("employer_id", employer_id)
    .limit(100);

  if (error) throw new Error(error.message || "Failed to fetch applications");
  return data;
};

export const listAllApplications = async () => {
  const { data, error } = await supabase.from("applications").select("*").limit(100);
  if (error) throw new Error(error.message || "Failed to fetch applications");
  return data;
};