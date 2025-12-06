import { supabase } from "../../supabaseClient";
import { Tables } from "../../types/supabase";

type Employer = Tables<"employers">;

const TABLE = "employers";

export interface EmployerFilters {
  company_name?: string;
  industry?: string;
  address?: string;
}

export async function getEmployers(
  filters: EmployerFilters = {},
): Promise<Employer[]> {
  let query = supabase.from(TABLE).select("*");

  if (filters.company_name) {
    query = query.ilike("company_name", `%${filters.company_name}%`);
  }

  if (filters.industry) {
    query = query.ilike("industry", `%${filters.industry}%`);
  }

  if (filters.address) {
    query = query.ilike("address", `%${filters.address}%`);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data ?? [];
}
