import { Request, Response } from "express";
import {
  createNewJob,
  getJobById,
  listJobs,
  updateJob as updateJobService,
  deleteJob as deleteJobService,
  getJobsByEmployerId,
  filterJobs as filterJobsService,
} from "../../services/jobs/jobService";
import { validationResult } from "express-validator";

export async function createJob(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const employerId = (req as any).user.id;
    const jobData = { ...req.body, employer_id: employerId };
    const job = await createNewJob(jobData);
    res.status(201).json(job);
  } catch (e: any) {
    res.status(500).json({ message: "Failed to create job", error: e.message });
  }
}

export async function getJob(req: Request, res: Response) {
  try {
    const job = await getJobById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (e: any) {
    res.status(500).json({ message: "Failed to fetch job", error: e.message });
  }
}

export async function listJobHandler(req: Request, res: Response) {
  const limit = parseInt((req.query.limit as string) || "50", 10);
  const offset = parseInt((req.query.offset as string) || "0", 10);

  if (
    Number.isNaN(limit) ||
    Number.isNaN(offset) ||
    limit < 1 ||
    limit > 100 ||
    offset < 0
  ) {
    return res.status(400).json({
      message:
        "Invalid query parameters: limit must be between 1 and 100; offset must be >= 0.",
    });
  }
  try {
    const jobs = await listJobs(limit, offset);
    res.json({ data: jobs, limit, offset });
  } catch (e: any) {
    res.status(500).json({ message: "Failed to list jobs", error: e.message });
  }
}

export async function updateJob(req: Request, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const employerId = (req as any).user.id;
    const updated = await updateJobService(req.params.id, req.body, employerId);
    if (!updated)
      return res.status(404).json({
        message: "Job not found or you do not have permission to update it",
      });
    res.json(updated);
  } catch (e: any) {
    res.status(500).json({ message: "Failed to update job", error: e.message });
  }
}

export async function deleteJob(req: Request, res: Response) {
  try {
    const employerId = (req as any).user.id;
    const ok = await deleteJobService(req.params.id, employerId);
    if (!ok)
      return res.status(404).json({
        message: "Job not found or you do not have permission to delete it",
      });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ message: "Failed to delete job", error: e.message });
  }
}

export async function getJobsByEmployer(req: Request, res: Response) {
  const limit = parseInt((req.query.limit as string) || "50", 10);
  const offset = parseInt((req.query.offset as string) || "0", 10);

  if (
    Number.isNaN(limit) ||
    Number.isNaN(offset) ||
    limit < 1 ||
    limit > 100 ||
    offset < 0
  ) {
    return res.status(400).json({
      message:
        "Invalid query parameters: limit must be between 1 and 100; offset must be >= 0.",
    });
  }

  try {
    const employerId = (req as any).user.id;
    const jobs = await getJobsByEmployerId(employerId, limit, offset);
    res.json({ data: jobs, limit, offset });
  } catch (e: any) {
    res.status(500).json({ message: "Failed to list jobs", error: e.message });
  }
}

export async function filterJobsHandler(req: Request, res: Response) {
  const limit = parseInt((req.query.limit as string) || "50", 10);
  const offset = parseInt((req.query.offset as string) || "0", 10);

  if (
    Number.isNaN(limit) ||
    Number.isNaN(offset) ||
    limit < 1 ||
    limit > 100 ||
    offset < 0
  ) {
    return res.status(400).json({
      message:
        "Invalid query parameters: limit must be between 1 and 100; offset must be >= 0.",
    });
  }

  try {
    // Extract filter parameters from query
    const filters = {
      title: req.query.title as string | undefined,
      location: req.query.location as string | undefined,
      job_type: req.query.job_type as string | undefined,
      min_salary:
        req.query.min_salary !== undefined
          ? parseInt(req.query.min_salary as string, 10)
          : undefined,
      max_salary:
        req.query.max_salary !== undefined
          ? parseInt(req.query.max_salary as string, 10)
          : undefined,
      min_experience:
        req.query.min_experience !== undefined
          ? parseInt(req.query.min_experience as string, 10)
          : undefined,
      max_experience:
        req.query.max_experience !== undefined
          ? parseInt(req.query.max_experience as string, 10)
          : undefined,
      status: req.query.status as string | undefined,
      posted_after: req.query.posted_after as string | undefined,
      limit,
      offset,
    };

    // Validate numeric parameters
    if (filters.min_salary !== undefined && isNaN(filters.min_salary)) {
      return res.status(400).json({ message: "Invalid min_salary parameter" });
    }
    if (filters.max_salary !== undefined && isNaN(filters.max_salary)) {
      return res.status(400).json({ message: "Invalid max_salary parameter" });
    }
    if (filters.min_experience !== undefined && isNaN(filters.min_experience)) {
      return res
        .status(400)
        .json({ message: "Invalid min_experience parameter" });
    }
    if (filters.max_experience !== undefined && isNaN(filters.max_experience)) {
      return res
        .status(400)
        .json({ message: "Invalid max_experience parameter" });
    }

    const jobs = await filterJobsService(filters);
    res.json({ data: jobs, limit, offset });
  } catch (e: any) {
    res
      .status(500)
      .json({ message: "Failed to filter jobs", error: e.message });
  }
}
