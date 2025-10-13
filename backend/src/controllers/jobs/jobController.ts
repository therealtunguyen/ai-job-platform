import { Request, Response } from "express";
import {
  createNewJob,
  getJobById,
  listJobs,
  updateJob as updateJobService,
  deleteJob as deleteJobService,
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
      return res
        .status(404)
        .json({
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
      return res
        .status(404)
        .json({
          message: "Job not found or you do not have permission to delete it",
        });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ message: "Failed to delete job", error: e.message });
  }
}
