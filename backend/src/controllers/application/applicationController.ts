import { Request, Response, NextFunction } from "express";
import * as applicationService from "../../services/application/applicationService";

// Placeholder for submitting an application
export const submit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const created = await applicationService.submitApplication(req.body);
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


