import { supabase } from "../../supabaseClient";
import { deleteFileFromSupabase } from "../../utils/fileUpload";
import { Request } from "express";

interface ProfileImageData {
    userId: string;
    userType: string;
    file: Express.Multer.File;
    prefix?: string;
}

interface ProfileImageResult {
    success: boolean;
    publicUrl?: string;
    error?: string;
    fileName?: string;
}

/**
 * Upload and update profile image for user (handles both job seekers and employers)
 * @param imageData - Object containing user ID, user type, file, and optional prefix
 * @returns Result with success status, public URL, error message, and file name
 */
export const uploadAndSetProfileImage = async (
    imageData: ProfileImageData,
): Promise<ProfileImageResult> => {
    const { userId, userType, file, prefix = "" } = imageData;

    try {
        // Determine the storage bucket based on user type
        const bucketName = userType === "EMPLOYER" ? "logos" : "avatars";

        // Define the file name and path
        const timestamp = Date.now();
        const filePrefix = prefix ? `${prefix}_` : "";
        const fileName = `${filePrefix}_${userId}_${timestamp}_${file.originalname}`;
        const filePath = `${bucketName}/${fileName}`;

        // Upload the file to Supabase storage
        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file.buffer, {
                cacheControl: "3600",
                upsert: true,
                contentType: file.mimetype,
            });

        if (error) {
            console.error("Profile picture upload error:", error);
            return {
                success: false,
                error: error.message || "Upload failed",
            };
        }

        // Get the public URL for the uploaded file
        const { data: publicData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

        if (!publicData?.publicUrl) {
            return {
                success: false,
                error: "Could not get public URL",
            };
        }

        // Update the user's profile in the database with the new image URL
        let updateResult;
        if (userType === "JOB_SEEKER") {
            updateResult = await supabase
                .from("job_seekers")
                .update({
                    profile_picture: publicData.publicUrl,
                })
                .eq("user_id", userId);
        } else if (userType === "EMPLOYER") {
            updateResult = await supabase
                .from("employers")
                .update({
                    logo: publicData.publicUrl,
                })
                .eq("user_id", userId);
        }

        if (updateResult && updateResult.error) {
            console.error(
                "Error updating profile picture in DB:",
                updateResult.error,
            );
            // If DB update fails, remove the uploaded file
            await deleteFileFromSupabase(bucketName, filePath);
            return {
                success: false,
                error: updateResult.error.message || "Database update failed",
            };
        }

        return {
            success: true,
            publicUrl: publicData.publicUrl,
            fileName,
        };
    } catch (error: any) {
        console.error("Profile image upload error:", error);
        return {
            success: false,
            error: error.message || "Internal server error",
        };
    }
};

/**
 * Delete profile image for user (handles both job seekers and employers)
 * @param userId - The ID of the user
 * @param userType - The type of the user (JOB_SEEKER or EMPLOYER)
 * @returns Result with success status and error message
 */
export const deleteProfileImage = async (
    userId: string,
    userType: string,
): Promise<{ success: boolean; error?: string }> => {
    try {
        let profilePictureUrl: string | null = null;
        let tableToUpdate: string;
        let columnToUpdate: string;
        let expectedBucket: string;

        if (userType === "JOB_SEEKER") {
            // Get profile picture URL from job_seekers table
            const { data: seekerProfile, error: seekerError } = await supabase
                .from("job_seekers")
                .select("profile_picture")
                .eq("user_id", userId)
                .single();

            if (seekerError) {
                return {
                    success: false,
                    error: "Error fetching job seeker profile",
                };
            }

            profilePictureUrl = seekerProfile.profile_picture;
            tableToUpdate = "job_seekers";
            columnToUpdate = "profile_picture";
            expectedBucket = "avatars";
        } else if (userType === "EMPLOYER") {
            // Get logo URL from employers table
            const { data: employerProfile, error: employerError } =
                await supabase
                    .from("employers")
                    .select("logo")
                    .eq("user_id", userId)
                    .single();

            if (employerError) {
                return {
                    success: false,
                    error: "Error fetching employer profile",
                };
            }

            profilePictureUrl = employerProfile.logo;
            tableToUpdate = "employers";
            columnToUpdate = "logo";
            expectedBucket = "logos";
        } else {
            return {
                success: false,
                error: "Invalid user type",
            };
        }

        if (profilePictureUrl) {
            // Extract file path from the public URL
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
                return {
                    success: false,
                    error: "Could not parse file path from URL",
                };
            }

            if (filePath && bucketToUse) {
                // Delete the file from storage
                const deleteResult = await deleteFileFromSupabase(
                    bucketToUse,
                    filePath,
                );

                if (!deleteResult.success) {
                    return {
                        success: false,
                        error:
                            deleteResult.error?.message ||
                            "Error deleting file from storage",
                    };
                }
            }

            // Remove the reference from the appropriate database table
            const { error: updateError } = await supabase
                .from(tableToUpdate)
                .update({ [columnToUpdate]: null })
                .eq("user_id", userId);

            if (updateError) {
                return {
                    success: false,
                    error: "Error updating user profile",
                };
            }

            return {
                success: true,
            };
        } else {
            return {
                success: false,
                error: "Profile image not found",
            };
        }
    } catch (error: any) {
        console.error("Delete profile image error:", error);
        return {
            success: false,
            error: error.message || "Internal server error",
        };
    }
};

