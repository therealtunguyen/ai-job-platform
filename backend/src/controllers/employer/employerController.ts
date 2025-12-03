import { Request, Response } from "express";
import { supabase } from "../../supabaseClient";

// GET /api/employers
// Public listing of employers with basic filters
export const getEmployers = async (req: Request, res: Response) => {
  try {
    const { company_name, industry, address } = req.query;

    let query = supabase.from("employers").select("*");

    if (company_name && typeof company_name === "string") {
      query = query.ilike("company_name", `%${company_name}%`);
    }

    if (industry && typeof industry === "string") {
      query = query.ilike("industry", `%${industry}%`);
    }

    if (address && typeof address === "string") {
      query = query.ilike("address", `%${address}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching employers:", error);
      return res
        .status(500)
        .json({ error: "Failed to fetch employers", details: error.message });
    }

    return res.status(200).json({ data });
  } catch (error: any) {
    console.error("Unexpected error fetching employers:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message || "Unknown error",
    });
  }
};

