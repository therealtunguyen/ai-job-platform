import { Request, Response } from "express";
import {
  saveJob,
  unsaveJob,
  getSavedJobs,
  checkIfJobSaved,
  updateSavedJobNotes,
} from "../../services/savedJobs/savedJobsService";

/**
 * Controller to save a job
 * POST /api/saved-jobs
 */
export const saveJobHandler = async (req: Request, res: Response) => {
  try {
    // Get authenticated user from the request
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { job_id, notes } = req.body;

    // Validate required fields
    if (!job_id) {
      return res.status(400).json({
        error: "job_id is required",
      });
    }

    try {
      const savedJob = await saveJob(userId, job_id, notes);

      res.status(201).json({
        message: "Job saved successfully",
        savedJob: savedJob,
      });
    } catch (error: any) {
      if (error.message.includes("already saved")) {
        return res.status(409).json({ error: error.message });
      } else if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      } else if (error.message.includes("Only job seekers")) {
        return res.status(403).json({ error: error.message });
      }
      throw error;
    }
  } catch (error: any) {
    console.error("Error in saveJobHandler:", error);
    res.status(500).json({
      error: "Failed to save job",
      message: error.message,
    });
  }
};

/**
 * Controller to unsave a job
 * DELETE /api/saved-jobs/:jobId
 */
export const unsaveJobHandler = async (req: Request, res: Response) => {
  try {
    // Get authenticated user from the request
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { jobId } = req.params;

    // Validate job ID
    if (!jobId) {
      return res.status(400).json({
        error: "job_id is required",
      });
    }

    try {
      await unsaveJob(userId, jobId);

      res.status(200).json({
        message: "Job unsaved successfully",
      });
    } catch (error: any) {
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      } else if (error.message.includes("Only job seekers")) {
        return res.status(403).json({ error: error.message });
      }
      throw error;
    }
  } catch (error: any) {
    console.error("Error in unsaveJobHandler:", error);
    res.status(500).json({
      error: "Failed to unsave job",
      message: error.message,
    });
  }
};

/**
 * Controller to get all saved jobs for the authenticated user
 * GET /api/saved-jobs
 */
export const getSavedJobsHandler = async (req: Request, res: Response) => {
  try {
    // Get authenticated user from the request
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    try {
      const savedJobs = await getSavedJobs(userId);

      res.status(200).json({
        message: "Saved jobs retrieved successfully",
        savedJobs: savedJobs,
        count: savedJobs.length,
      });
    } catch (error: any) {
      if (error.message.includes("Only job seekers")) {
        return res.status(403).json({ error: error.message });
      }
      throw error;
    }
  } catch (error: any) {
    console.error("Error in getSavedJobsHandler:", error);
    res.status(500).json({
      error: "Failed to retrieve saved jobs",
      message: error.message,
    });
  }
};

/**
 * Controller to check if a specific job is saved
 * GET /api/saved-jobs/check/:jobId
 */
export const checkSavedStatusHandler = async (req: Request, res: Response) => {
  try {
    // Get authenticated user from the request
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { jobId } = req.params;

    // Validate job ID
    if (!jobId) {
      return res.status(400).json({
        error: "job_id is required",
      });
    }

    try {
      const status = await checkIfJobSaved(userId, jobId);

      res.status(200).json({
        message: "Saved status checked successfully",
        ...status,
      });
    } catch (error: any) {
      throw error;
    }
  } catch (error: any) {
    console.error("Error in checkSavedStatusHandler:", error);
    res.status(500).json({
      error: "Failed to check saved status",
      message: error.message,
    });
  }
};

/**
 * Controller to update notes for a saved job
 * PATCH /api/saved-jobs/:jobId/notes
 */
export const updateSavedJobNotesHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    // Get authenticated user from the request
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { jobId } = req.params;
    const { notes } = req.body;

    // Validate inputs
    if (!jobId) {
      return res.status(400).json({
        error: "job_id is required",
      });
    }

    if (notes === undefined || notes === null) {
      return res.status(400).json({
        error: "notes field is required",
      });
    }

    try {
      const updatedSavedJob = await updateSavedJobNotes(userId, jobId, notes);

      res.status(200).json({
        message: "Notes updated successfully",
        savedJob: updatedSavedJob,
      });
    } catch (error: any) {
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      throw error;
    }
  } catch (error: any) {
    console.error("Error in updateSavedJobNotesHandler:", error);
    res.status(500).json({
      error: "Failed to update notes",
      message: error.message,
    });
  }
};
