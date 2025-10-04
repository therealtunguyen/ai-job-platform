import { supabase } from "../../supabaseClient";


const TRANSITIONS: Record<string, string[]> = {
  submitted: ["reviewed", "rejected"],
  reviewed: ["interview", "rejected"],
  interview: ["offered", "rejected"],
  offered: ["accepted", "rejected"],
  accepted: [],
  rejected: [],
};

// Placeholder for application tracking service
export const createApplication = async (applicationData: any) => {
  if (!applicationData.candidate_name || !applicationData.job_id) {
    throw new Error("Missing required fields: Candidate name and JobID");
  }
  const payload = {
    ...applicationData,
    status: applicationData.status ?? "submitted",
  };

  const { data, error } = await supabase
    .from("applications")
    .insert([payload])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// Fetch application by ID
export const getApplicationById = async (id: string) => {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('id', id)
    .single();
  if (error) {
    if (error.details?.includes("No rows found")) return null;
    throw new Error(error.message);
  }
  return data;
};

// Update application status with transition validation
export const updateApplicationStatus = async (id: string, newStatus: string) => {
  const allStatuses = new Set<string>([
    ...Object.keys(TRANSITIONS),
    ...Object.values(TRANSITIONS).flat(),
  ]);
  if (!allStatuses.has(newStatus)) {
    throw new Error("Invalid status");
  }

  const current = await getApplicationById(id);
  if (!current) {
    throw new Error("Application not found");
  }

  const allowedNextStatuses = TRANSITIONS[current.status] ?? [];
  if (current.status !== newStatus && !allowedNextStatuses.includes(newStatus)) {
    throw new Error("Invalid status transition");
  }

  const { data, error } = await supabase
    .from("applications")
    .update({ status: newStatus })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// Get all applications for a specific employer
export const getAllApplicationsForEmployer = async (employerId: string) => {
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("employer_id", employerId);

  if (error) throw new Error(error.message);
  return data;
};