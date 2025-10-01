import { Request, Response, NextFunction } from "express";

// Placeholder for error handling middleware
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!", error: err.message });
};
