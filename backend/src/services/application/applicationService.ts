import { supabase } from "../../supabaseClient";

const ALLOWED_STATUSES = ["submitted", "reviewed", "interview", "offered", "accepted", "rejected"] as const;

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
  console.log("Creating application", applicationData);
  const { data, error } = await supabase
    .from('applications')
    .insert([applicationData])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return { id: "app-789", status: "submitted", ...applicationData };
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
  if (!ALLOWED_STATUSES.includes(newStatus as any)) {
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
    .from('applications')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};