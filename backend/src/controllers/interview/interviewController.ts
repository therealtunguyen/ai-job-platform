import { Request, Response } from "express";

// Placeholder for starting an interview
export const startInterview = (req: Request, res: Response) => {
  res.status(200).json({ message: "Interview started (placeholder)" });
};

// Placeholder for submitting interview answers
export const submitAnswer = (req: Request, res: Response) => {
  res.status(200).json({ message: "Answer submitted (placeholder)" });
};
