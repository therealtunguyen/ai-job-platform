import { Request, Response } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
} from "../../services/auth/authService";
import { uploadAndSetProfileImage } from "../../services/users/profileImageService";
import { supabase } from "../../supabaseClient";

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
            const userId = result.user?.user_id;
            if (userId) {
                // Use the shared service to handle profile image upload
                const uploadResult = await uploadAndSetProfileImage({
                    userId,
                    userType,
                    file: req.file,
                    prefix: "registration" // Add a prefix to distinguish registration uploads
                });

                if (!uploadResult.success) {
                    console.error("Profile picture upload error during registration:", uploadResult.error);
                    // Continue with registration even if profile picture fails - just log the error
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
