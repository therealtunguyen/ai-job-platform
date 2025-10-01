import { Request, Response } from "express";
import {
    uploadFileToSupabase,
    deleteFileFromSupabase,
} from "../../utils/fileUpload";
import { supabase } from "../../supabaseClient";

/**
 * Upload a profile image
 * @param req - Express request object with file
 * @param res - Express response object
 */
export const uploadProfileImage = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image file provided" });
        }

        // Get the authenticated user ID from the request (assuming JWT middleware is used)
        // This assumes you have user information in the request after JWT verification
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        // First check the user type to determine which storage bucket to use
        const { data: userProfile, error: profileError } = await supabase
            .from("user_profiles")
            .select("user_type")
            .eq("user_id", userId)
            .single();

        if (profileError) {
            return res
                .status(500)
                .json({ error: "Error fetching user profile" });
        }

        // Determine the storage bucket based on user type
        let bucketName: string;
        if (userProfile.user_type === "EMPLOYER") {
            bucketName = "logos";
        } else {
            // JOB_SEEKER
            bucketName = "avatars";
        }

        // Define the file path in the storage bucket
        const fileName = `${userProfile.user_type.toLowerCase()}_${userId}_${Date.now()}_${req.file.originalname}`;
        const filePath = `${bucketName}/${fileName}`;

        // Upload the file to Supabase storage
        const uploadResult = await uploadFileToSupabase(
            req.file,
            bucketName,
            filePath,
        );

        if (uploadResult.error) {
            return res.status(500).json({
                error: `Upload failed: ${uploadResult.error.message || uploadResult.error}`,
            });
        }

        // Update the user's profile in the database with the new image URL
        // (userProfile and profileError were already fetched above)
        if (profileError) {
            return res
                .status(500)
                .json({ error: "Error fetching user profile" });
        }

        let updateResult;
        if (userProfile.user_type === "JOB_SEEKER") {
            updateResult = await supabase
                .from("job_seekers")
                .update({ profile_picture: uploadResult.publicUrl })
                .eq("user_id", userId);
        } else if (userProfile.user_type === "EMPLOYER") {
            // Update the logo field in the employers table
            updateResult = await supabase
                .from("employers")
                .update({ logo: uploadResult.publicUrl })
                .eq("user_id", userId);
        }

        if (updateResult && updateResult.error) {
            // If database update fails, we should clean up the uploaded file
            await deleteFileFromSupabase(bucketName, filePath);
            return res
                .status(500)
                .json({ error: "Error updating user profile" });
        }

        res.status(200).json({
            message: "Profile image uploaded successfully",
            publicUrl: uploadResult.publicUrl,
            fileName: fileName,
        });
    } catch (error: any) {
        console.error("Upload profile image error:", error);
        res.status(500).json({
            error: error.message || "Internal server error",
        });
    }
};

/**
 * Delete a profile image
 */
export const deleteProfileImage = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        // First check the user type to know which table to query for the profile picture
        const { data: userProfileForDelete, error: profileError } =
            await supabase
                .from("user_profiles")
                .select("user_type")
                .eq("user_id", userId)
                .single();

        if (profileError) {
            return res
                .status(500)
                .json({ error: "Error fetching user profile" });
        }

        let profilePictureUrl: string | null = null;
        let tableToUpdate: string;
        let columnToUpdate: string;
        let expectedBucket: string;

        if (userProfileForDelete.user_type === "JOB_SEEKER") {
            // Get profile picture URL from job_seekers table
            const { data: seekerProfile, error: seekerError } = await supabase
                .from("job_seekers")
                .select("profile_picture")
                .eq("user_id", userId)
                .single();

            if (seekerError) {
                return res
                    .status(500)
                    .json({ error: "Error fetching job seeker profile" });
            }

            profilePictureUrl = seekerProfile.profile_picture;
            tableToUpdate = "job_seekers";
            columnToUpdate = "profile_picture";
            expectedBucket = "avatars";
        } else if (userProfileForDelete.user_type === "EMPLOYER") {
            // For employers, check if there's a logo or profile picture field in the employers table
            const { data: employerProfile, error: employerError } =
                await supabase
                    .from("employers")
                    .select("*") // Get all fields to see what's available
                    .eq("user_id", userId)
                    .single();

            if (employerError) {
                return res
                    .status(500)
                    .json({ error: "Error fetching employer profile" });
            }

            // Check if there's a logo field, otherwise check for a profile_picture field
            profilePictureUrl =
                employerProfile.logo || employerProfile.profile_picture || null;
            tableToUpdate = "employers";
            // Use the appropriate field name - either logo if it exists, or profile_picture
            columnToUpdate =
                employerProfile.logo !== undefined ? "logo" : "profile_picture";
            expectedBucket = "logos";
        } else {
            return res.status(400).json({ error: "Invalid user type" });
        }

        if (profilePictureUrl) {
            // Extract file path from the public URL, handling both buckets
            const avatarsMatch = profilePictureUrl.match(/avatars\/(.*)$/);
            const logosMatch = profilePictureUrl.match(/logos\/(.*)$/);

            let filePath: string | null = null;
            let bucketToUse: string | null = null;

            if (avatarsMatch && avatarsMatch[1]) {
                filePath = `avatars/${avatarsMatch[1]}`;
                bucketToUse = "avatars";
            } else if (logosMatch && logosMatch[1]) {
                filePath = `logos/${logosMatch[1]}`;
                bucketToUse = "logos";
            } else {
                return res
                    .status(500)
                    .json({ error: "Could not parse file path from URL" });
            }

            if (filePath && bucketToUse) {
                // Delete the file from storage
                const { success, error } = await deleteFileFromSupabase(
                    bucketToUse,
                    filePath,
                );

                if (!success) {
                    return res.status(500).json({
                        error:
                            error?.message ||
                            "Error deleting file from storage",
                    });
                }
            }

            // Remove the reference from the appropriate database table
            const { error: updateError } = await supabase
                .from(tableToUpdate)
                .update({ [columnToUpdate]: null })
                .eq("user_id", userId);

            if (updateError) {
                return res
                    .status(500)
                    .json({ error: "Error updating user profile" });
            }

            res.status(200).json({
                message: "Profile image deleted successfully",
            });
        } else {
            res.status(404).json({ error: "Profile image not found" });
        }
    } catch (error: any) {
        console.error("Delete profile image error:", error);
        res.status(500).json({
            error: error.message || "Internal server error",
        });
    }
};

