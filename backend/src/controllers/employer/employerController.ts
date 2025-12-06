import { Request, Response } from "express";
import * as employerService from "../../services/employer/employerService";

// GET /api/employers
// Public listing of employers with basic filters
export const getEmployers = async (req: Request, res: Response) => {
  try {
    const { company_name, industry, address } = req.query;

    // Validate query parameters
    const filters: employerService.EmployerFilters = {};

    if (company_name && typeof company_name === "string") {
      filters.company_name = company_name;
    }

    if (industry && typeof industry === "string") {
      filters.industry = industry;
    }

    if (address && typeof address === "string") {
      filters.address = address;
    }

    const data = await employerService.getEmployers(filters);

    return res.status(200).json({ data });
  } catch (error: any) {
    console.error("Error fetching employers:", error);
    return res.status(500).json({
      error: "Failed to fetch employers",
      details: error.message || "Unknown error",
    });
  }
};
