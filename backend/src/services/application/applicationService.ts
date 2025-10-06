import { supabase } from "../../supabaseClient";
import type { PostgrestSingleResponse, PostgrestResponse } from "@supabase/supabase-js";

export type ApplicationPayload = {
  candidate_id: string;
  job_id: string;
  status?: "submitted" | "reviewed" | "accepted" | "rejected" | "withdrawn" | "shortlisted" | "interviewed" | "offered";
  applied_at?: string;
};

// Placeholder for application tracking service
export const createApplication = async (payload: ApplicationPayload) => {
   if (!payload.job_id) throw new Error("Missing required field: job_id");
  if (!payload.candidate_id) throw new Error("Missing required field: candidate_id");

  const record = {
    candidate_id: payload.candidate_id,
    job_id: payload.job_id,
    status: payload.status || "SUBMITTED",
    applied_at: payload.applied_at ?? new Date().toISOString(),
  };

  const { data, error }: PostgrestSingleResponse<any> = await supabase
    .from("applications")
    .insert(record)
    .select()
    .single();

  if (error) throw new Error(error.message || "Failed to insert application");
  return data;
};


export const listApplicationsByJob = async (job_id: string) => {
  if (!job_id) throw new Error("Missing job_id");

  const { data, error }: PostgrestResponse<any[]> = await supabase
    .from("applications")
    .select("*")
    .eq("job_id", job_id);

  if (error) throw new Error(error.message || "Failed to fetch applications");
  return data;
};