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
export const getAll = async (req: Request, res: Response) => {
  const employer_id = req.query.employer_id as string | undefined;

  try {
    const rows = employer_id
      ? await applicationService.listApplicationsByEmployer(employer_id)
      : await applicationService.listAllApplications(); // new fallback
    return res.json({ data: rows });
  } catch (err) {
    console.error("Error listing applications:", err);
    const message = err instanceof Error ? err.message : "Unknown server error";
    return res.status(500).json({ error: message });
  }
};


