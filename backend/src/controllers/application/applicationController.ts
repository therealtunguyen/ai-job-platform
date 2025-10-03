import { Request, Response } from "express";
import * as applicationService from "../../services/application/applicationService";

// Placeholder for submitting an application
export const submitApplication = (req: Request, res: Response) => {
  try{
    const {userId, jobID, coverLetter, resumeUrl} = req.body;
    if (!userID || !jobID) {
      return res.status(400).json({ message: "UserID and JobID are required"});
    }
    const created = await applicationService.submitApplication({
      userId, 
      jobID, 
      coverLetter: coverLetter ?? null, 
      resumeUrl: resumeUrl ?? null,
      status: "submitted",
      created_at: new Date().toISOString(),
  });
  res.status(201).json(created);
  } catch(error: any){
    console.error("Submit Application Error:",error);
    res.status(500).json({ message: "Failed to submit application", error: error.message });
  }
};

// Placeholder for getting application status
export const getApplicationStatus = (req: Request, res: Response) => {
  try{
    const {id} = req.params;
    const application = await applicationService.getApplicationById(id);
    if (!application) return res.status(404).json({ message: "Application not found" });
    res.status(200).json(application);
  } catch(error: any){
    console.error("Get Application Status Error:",error);
    res.status(500).json({ message: "Failed to retrieve application status", error: error.message });
  }
};

//Update application status
export const updateApplicationStatus = async (req: Request, res: Response) => {
  try{
    const {id} = req.params;
    const {status} = req.body;
    if (!status) return res.status(400).json({ message: "Status is required" });

    const updated = await applicationService.updateApplicationStatus(id, status);
    if (!updated) return res.status(404).json({ message: "Application not found" });
    res.status(200).json(updated);
  } catch (error: any){
    console.error("Update Application Status Error:",error);
    if(error.message === "Application not found") return res.status(404).json({ message: error.message});
    if(error.message === "Invalid status") return res.status(400).json({ message: error.message});
    res.status(500).json({ message: "Failed to update application status", error: error.message });
  }
};

