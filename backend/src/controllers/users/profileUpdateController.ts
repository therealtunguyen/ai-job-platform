import { Request, Response } from "express";
import {
    updateJobSeekerProfile,
    updateEmployerProfile,
    getJobSeekerProfile,
    getEmployerProfile,
    UpdateJobSeekerProfileData,
    UpdateEmployerProfileData,
} from "../../services/users/profileUpdateService";
import {
    uploadAndSetProfileImage,
    deleteProfileImage,
} from "../../services/users/profileImageService";
import multer from "multer";

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only image files
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed") as any, false);
        }
    },
});

/**
 * Update job seeker profile
 */
export const updateJobSeekerProfileHandler = async (
    req: Request,
    res: Response,
) => {
    try {
        const userId = (req as any).user?.id;
        const userType = (req as any).user?.user_type;

        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        // Verify that the user is actually a job seeker
        if (userType !== "JOB_SEEKER") {
            return res.status(403).json({
                error: "Access denied. Only job seekers can update this profile.",
            });
        }

        const profileData: UpdateJobSeekerProfileData = req.body;

        const result = await updateJobSeekerProfile(userId, profileData);

        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }

        res.status(200).json({
            message: "Job seeker profile updated successfully",
            data: result.data,
        });
    } catch (error: any) {
        console.error("Error updating job seeker profile:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Update employer profile
 */
export const updateEmployerProfileHandler = async (
    req: Request,
    res: Response,
) => {
    try {
        const userId = (req as any).user?.id;
        const userType = (req as any).user?.user_type;

        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        // Verify that the user is actually an employer
        if (userType !== "EMPLOYER") {
            return res.status(403).json({
                error: "Access denied. Only employers can update this profile.",
            });
        }

        const profileData: UpdateEmployerProfileData = req.body;

        const result = await updateEmployerProfile(userId, profileData);

        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }

        res.status(200).json({
            message: "Employer profile updated successfully",
            data: result.data,
        });
    } catch (error: any) {
        console.error("Error updating employer profile:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Get current user profile (job seeker or employer)
 */
export const getCurrentUserProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const userType = (req as any).user?.user_type;

        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        if (!userType) {
            return res
                .status(400)
                .json({ error: "User type not specified in token" });
        }

        let result;

        if (userType === "JOB_SEEKER") {
            result = await getJobSeekerProfile(userId);
        } else if (userType === "EMPLOYER") {
            result = await getEmployerProfile(userId);
        } else {
            return res.status(400).json({ error: "Invalid user type" });
        }

        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }

        res.status(200).json({
            data: result.data,
        });
    } catch (error: any) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Upload and update profile image
 */
export const uploadProfileImageHandler = [
    upload.single("profile_image"),
    async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;
            const userType = (req as any).user?.user_type;

            if (!userId) {
                return res
                    .status(401)
                    .json({ error: "User not authenticated" });
            }

            if (!req.file) {
                return res
                    .status(400)
                    .json({ error: "No image file provided" });
            }

            if (!userType) {
                return res
                    .status(400)
                    .json({ error: "User type not specified in token" });
            }

            const result = await uploadAndSetProfileImage({
                userId,
                userType,
                file: req.file,
                prefix: "profile",
            });

            if (!result.success) {
                return res.status(400).json({ error: result.error });
            }

            res.status(200).json({
                message: "Profile image updated successfully",
                publicUrl: result.publicUrl,
                fileName: result.fileName,
            });
        } catch (error: any) {
            console.error("Error uploading profile image:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    },
];

/**
 * Delete profile image
 */
export const deleteProfileImageHandler = async (
    req: Request,
    res: Response,
) => {
    try {
        const userId = (req as any).user?.id;
        const userType = (req as any).user?.user_type;

        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        if (!userType) {
            return res
                .status(400)
                .json({ error: "User type not specified in token" });
        }

        const result = await deleteProfileImage(userId, userType);

        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }

        res.status(200).json({
            message: "Profile image deleted successfully",
        });
    } catch (error: any) {
        console.error("Error deleting profile image:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Update profile fields and image in one request
 */
export const updateProfileAndImageHandler = [
    upload.single("profile_image"),
    async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;
            const userType = (req as any).user?.user_type;

            if (!userId) {
                return res
                    .status(401)
                    .json({ error: "User not authenticated" });
            }

            if (!userType) {
                return res
                    .status(400)
                    .json({ error: "User type not specified in token" });
            }

            // First, update profile fields if provided
            let profileUpdateResult;

            if (userType === "JOB_SEEKER") {
                const jobSeekerData: UpdateJobSeekerProfileData = req.body;
                profileUpdateResult = await updateJobSeekerProfile(
                    userId,
                    jobSeekerData,
                );
            } else if (userType === "EMPLOYER") {
                const employerData: UpdateEmployerProfileData = req.body;
                profileUpdateResult = await updateEmployerProfile(
                    userId,
                    employerData,
                );
            } else {
                return res.status(400).json({ error: "Invalid user type" });
            }

            if (!profileUpdateResult.success) {
                return res
                    .status(400)
                    .json({ error: profileUpdateResult.error });
            }

            // Then, update profile image if provided
            if (req.file) {
                const imageResult = await uploadAndSetProfileImage({
                    userId,
                    userType,
                    file: req.file,
                    prefix: "profile",
                });

                if (!imageResult.success) {
                    return res.status(400).json({ error: imageResult.error });
                }
            }

            res.status(200).json({
                message: "Profile updated successfully",
                data: profileUpdateResult.data,
            });
        } catch (error: any) {
            console.error("Error updating profile and image:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    },
];
