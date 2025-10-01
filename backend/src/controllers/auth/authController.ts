import { Request, Response } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
} from "../../services/auth/authService";
import { supabase } from "../../supabaseClient";
import { deleteFileFromSupabase } from "../../utils/fileUpload";

// Register a new user (handles both with and without avatar)
export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, userType, fullName } = req.body;

        if (!email || !password || !userType) {
            return res.status(400).json({
                error: "Email, password, and user type are required",
            });
        }

        // If there's an avatar file to upload, we'll process it separately after user creation
        const result = await registerUser({
            email,
            password,
            userType,
            fullName,
            // profilePicture will be null if no file was provided
            profilePicture: undefined, // We'll handle profile picture separately after registration
        });

        if (result.error) {
            return res.status(400).json({
                error: result.error.message || "Registration failed",
            });
        }

        // If there's an avatar file to upload, upload it after user creation
        if (req.file) {
            // Determine the storage bucket based on user type
            let bucketName: string;
            if (userType === "EMPLOYER") {
                bucketName = "logos";
            } else {
                // JOB_SEEKER
                bucketName = "avatars";
            }

            const userId = result.user?.user_id;
            if (userId) {
                const fileName = `${userType.toLowerCase()}_${userId}_${Date.now()}_${req.file.originalname}`;
                const filePath = `${bucketName}/${fileName}`;

                // Upload the profile picture to Supabase storage
                const { data, error } = await supabase.storage
                    .from(bucketName)
                    .upload(filePath, req.file.buffer, {
                        cacheControl: "3600",
                        upsert: true,
                        contentType: req.file.mimetype,
                    });

                if (error) {
                    console.error("Profile picture upload error:", error);
                    // Continue with registration even if profile picture fails - just log the error
                } else {
                    // Get the public URL for the uploaded file
                    const { data: publicData } = supabase.storage
                        .from(bucketName)
                        .getPublicUrl(filePath);

                    if (publicData?.publicUrl) {
                        let updateResult;
                        if (userType === "JOB_SEEKER") {
                            // Update the job seeker's profile with the profile picture URL
                            updateResult = await supabase
                                .from("job_seekers")
                                .update({
                                    profile_picture: publicData.publicUrl,
                                })
                                .eq("user_id", userId);
                        } else if (userType === "EMPLOYER") {
                            // Update the employer's profile with the logo URL
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
                        }
                    }
                }
            }
        }

        res.status(201).json({
            message: "User registered successfully",
            user: result.user,
        });
    } catch (error: any) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Login a user
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required",
            });
        }

        const result = await loginUser({ email, password });

        if (result.error) {
            return res.status(401).json({
                error: result.error.message || "Login failed",
            });
        }

        res.status(200).json({
            message: "Login successful",
            user: result.user,
            session: result.session,
        });
    } catch (error: any) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Logout a user
export const logout = async (req: Request, res: Response) => {
    try {
        const result = await logoutUser();

        if (result.error) {
            return res.status(400).json({
                error: result.error.message || "Logout failed",
            });
        }

        res.status(200).json({ message: "Logged out successfully" });
    } catch (error: any) {
        console.error("Logout error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get current user profile
export const getCurrentUserProfile = async (req: Request, res: Response) => {
    try {
        const result = await getCurrentUser();

        if (result.error) {
            return res.status(401).json({
                error: result.error.message || "Failed to get user profile",
            });
        }

        if (!result.user) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        res.status(200).json({ user: result.user });
    } catch (error: any) {
        console.error("Get user profile error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
