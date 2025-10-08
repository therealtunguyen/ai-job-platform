import { Request, Response } from "express";
import { supabase } from "../../supabaseClient";
import {
    createAppWithValidation,
    updateApplicationStatus as updateAppStatus,
    listUserApplications as listUserApps,
    listJobApplications as listEmployerApps,
    listApplicationsForJob as listJobApps,
    getApplicationById as getAppById,
    employerCanAccessApp,
} from "../../services/application/applicationService";

// Controller for submitting an application
export const submitApplication = async (req: Request, res: Response) => {
    try {
        // Get authenticated user from the request
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        const { job_id } = req.body;

        // Validate required fields
        if (!job_id) {
            return res.status(400).json({
                error: "job_id is required",
            });
        }

        try {
            const applicationData = {
                candidate_id: userId, // The authenticated user is the candidate
                job_id,
                status: "SUBMITTED" as const,
            };

            const application = await createAppWithValidation(
                applicationData,
                userId,
            );

            res.status(201).json({
                message: "Application submitted successfully",
                application: application,
            });
        } catch (error: any) {
            if (error.message.includes("already exists")) {
                return res.status(409).json({ error: error.message });
            } else if (error.message.includes("not found")) {
                return res.status(404).json({ error: error.message });
            } else if (
                error.message.includes("Unauthorized") ||
                error.message.includes("Only job seekers")
            ) {
                return res.status(403).json({ error: error.message });
            }
            console.error("Error in createAppWithValidation service:", error);
            res.status(500).json({ error: "Failed to submit application" });
        }
    } catch (error) {
        console.error("Unexpected error in submitApplication:", error);
        res.status(500).json({
            error: "An unexpected error occurred",
        });
    }
};

// Controller for getting complete application data by ID
export const getApplicationById = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                error: "Application ID is required",
            });
        }

        try {
            const application = await getAppById(id, userId);
            res.status(200).json(application);
        } catch (error: any) {
            if (
                error.message.includes("Access denied") ||
                error.message.includes("not found")
            ) {
                return res.status(403).json({ error: error.message });
            }
            console.error("Error in getApplicationById service:", error);
            res.status(500).json({ error: "Failed to retrieve application" });
        }
    } catch (error) {
        console.error("Unexpected error in getApplicationById:", error);
        res.status(500).json({
            error: "An unexpected error occurred",
        });
    }
};

// Controller for updating application status
export const updateApplicationStatus = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        const { id } = req.params;
        const { status } = req.body;

        if (!id) {
            return res.status(400).json({
                error: "Application ID is required",
            });
        }

        if (!status) {
            return res.status(400).json({
                error: "New status is required",
            });
        }

        // Verify that the status is valid
        const validStatuses: Array<string> = [
            "SUBMITTED",
            "REVIEWED",
            "SHORTLISTED",
            "INTERVIEWED",
            "OFFERED",
            "ACCEPTED",
            "REJECTED",
            "WITHDRAWN",
        ];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                error: `Invalid status. Valid statuses are: ${validStatuses.join(", ")}`,
            });
        }

        // Verify that the user is an employer
        const { data: userProfile, error: profileError } = await supabase
            .from("user_profiles")
            .select("user_type")
            .eq("user_id", userId)
            .single();

        if (
            profileError ||
            !userProfile ||
            userProfile.user_type !== "EMPLOYER"
        ) {
            return res.status(403).json({
                error: "Only employers can update application status",
            });
        }

        // Verify that the employer can access this application
        const { canAccess, error: accessError } = await employerCanAccessApp(
            id,
            userId,
        );
        if (!canAccess) {
            return res.status(403).json({
                error: "Application not found or you don't have permission to update it",
            });
        }

        try {
            const updatedApplication = await updateAppStatus(id, status as any);
            res.status(200).json({
                message: "Application status updated successfully",
                application: updatedApplication,
            });
        } catch (error: any) {
            console.error("Error in updateApplicationStatus service:", error);
            res.status(500).json({
                error: "Failed to update application status",
            });
        }
    } catch (error) {
        console.error("Unexpected error in updateApplicationStatus:", error);
        res.status(500).json({
            error: "An unexpected error occurred",
        });
    }
};

// Controller for listing user applications
export const listUserApplications = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        const { userId: requestedUserId } = req.params;

        if (!requestedUserId) {
            return res.status(400).json({
                error: "User ID is required",
            });
        }

        // Fetch user profile once to reuse the result
        const { data: userProfile, error: profileError } = await supabase
            .from("user_profiles")
            .select("user_type")
            .eq("user_id", userId)
            .single();

        if (profileError || !userProfile) {
            return res.status(403).json({
                error: "User profile not found",
            });
        }

        // Verify that the authenticated user is requesting their own applications
        if (userId !== requestedUserId) {
            // Check if the user is an employer trying to access job seeker applications
            if (userProfile.user_type !== "EMPLOYER") {
                return res.status(403).json({
                    error: "You can only access your own applications",
                });
            }
        }

        // Only job seekers should be able to list their applications this way
        if (userProfile.user_type !== "JOB_SEEKER") {
            return res.status(403).json({
                error: "Only job seekers can access this endpoint",
            });
        }

        try {
            const applications = await listUserApps(requestedUserId);
            res.status(200).json({ applications });
        } catch (error: any) {
            console.error("Error in listUserApplications service:", error);
            res.status(500).json({
                error: "Failed to retrieve user applications",
            });
        }
    } catch (error) {
        console.error("Unexpected error in listUserApplications:", error);
        res.status(500).json({
            error: "An unexpected error occurred",
        });
    }
};

// Controller for listing applications for an employer's jobs
export const listJobApplications = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        const { employerId } = req.params;

        if (!employerId) {
            return res.status(400).json({
                error: "Employer ID is required",
            });
        }

        // Verify that the authenticated user is an employer and requesting their own data
        if (userId !== employerId) {
            return res.status(403).json({
                error: "Access denied. You can only access applications for your own jobs.",
            });
        }

        // Verify that the user is actually an employer
        const { data: userProfile, error: profileError } = await supabase
            .from("user_profiles")
            .select("user_type")
            .eq("user_id", userId)
            .single();

        if (
            profileError ||
            !userProfile ||
            userProfile.user_type !== "EMPLOYER"
        ) {
            return res.status(403).json({
                error: "Only employers can access this endpoint",
            });
        }

        try {
            // This gets all applications for all jobs posted by this employer
            const applications = await listEmployerApps(employerId);
            res.status(200).json({ applications });
        } catch (error: any) {
            console.error("Error in listJobApplications service:", error);
            res.status(500).json({
                error: "Failed to retrieve job applications",
            });
        }
    } catch (error) {
        console.error("Unexpected error in listJobApplications:", error);
        res.status(500).json({
            error: "An unexpected error occurred",
        });
    }
};

// Controller for listing applications for a specific job
export const listApplicationsForJob = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        const { jobId } = req.params;

        if (!jobId) {
            return res.status(400).json({
                error: "Job ID is required",
            });
        }

        // Verify that the user is an employer
        const { data: userProfile, error: profileError } = await supabase
            .from("user_profiles")
            .select("user_type")
            .eq("user_id", userId)
            .single();

        if (
            profileError ||
            !userProfile ||
            userProfile.user_type !== "EMPLOYER"
        ) {
            return res.status(403).json({
                error: "Only employers can access this endpoint",
            });
        }

        try {
            const applications = await listJobApps(jobId, userId);
            res.status(200).json({ applications });
        } catch (error: any) {
            if (
                error.message.includes("not found") ||
                error.message.includes("does not belong")
            ) {
                return res.status(403).json({ error: error.message });
            }
            console.error("Error in listApplicationsForJob service:", error);
            res.status(500).json({
                error: "Failed to retrieve job applications",
            });
        }
    } catch (error) {
        console.error("Unexpected error in listApplicationsForJob:", error);
        res.status(500).json({
            error: "An unexpected error occurred",
        });
    }
};
