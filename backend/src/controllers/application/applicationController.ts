import { Request, Response, NextFunction } from "express";
import * as applicationService from "../../services/application/applicationService";

// Placeholder for submitting an application
export const create = async (req: Request, res: Response) => {
  try {
    const created = await applicationService.createApplication(req.body);
    console.log("Created application:", created);
    return res.status(201).json(created);
  } catch (err) {
    console.error("Error create application:", err);
    const message = err instanceof Error ? err.message : "Unknown server error";
    return res.status(400).json({ error: message });
  }
};

// Placeholder for getting application status
export const getByJob = async (req: Request, res: Response) => {
  const job_id = req.query.job_id as string | undefined;

  try {
    if (!job_id) {
      return res.status(400).json({ error: "Missing required query parameter: job_id" });
    }

    const rows = await applicationService.listApplicationsByJob(job_id);
    return res.json({ data: rows });
  } catch (err) {
    console.error("Error fetching applications by job:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

