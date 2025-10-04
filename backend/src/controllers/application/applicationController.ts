import { Request, Response, NextFunction } from "express";
import * as applicationService from "../../services/application/applicationService";

// Placeholder for submitting an application
export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const created = await applicationService.createApplication(req.body);
    return res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

// Placeholder for getting application status
export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await applicationService.updateApplicationStatus(id, status);
    return res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

// New controller to get all applications for a specific employer
export const getAllApplications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employerId = req.query.employer_id as string;

    if (!employerId) {
      return res.status(400).json({ error: "Missing required query parameter: employer_id" });
    }

    const applications = await applicationService.getAllApplicationsForEmployer(employerId);
    return res.status(200).json(applications);
  } catch (err) {
    next(err);
  }
};


