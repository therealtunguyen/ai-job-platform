import { Request, Response } from "express";

// Placeholder for submitting an application
export const submitApplication = (req: Request, res: Response) => {
  res.status(201).json({ message: "Application submitted (placeholder)" });
};

// Placeholder for getting application status
export const getApplicationStatus = (req: Request, res: Response) => {
  res.status(200).json({ message: "Application status retrieved (placeholder)" });
};
