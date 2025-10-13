import { Request, Response } from "express";
import { supabase } from "../../supabaseClient";
import {
  uploadAndSetProfileImage,
  deleteProfileImage as deleteProfileImageService,
} from "../../services/users/profileImageService";

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
      return res.status(500).json({ error: "Error fetching user profile" });
    }

    // Use the shared service to handle profile image upload
    const uploadResult = await uploadAndSetProfileImage({
      userId,
      userType: userProfile.user_type,
      file: req.file,
      prefix: "profile", // Add a prefix to distinguish profile updates
    });

    if (!uploadResult.success) {
      return res.status(500).json({
        error: `Upload failed: ${uploadResult.error}`,
      });
    }

    res.status(200).json({
      message: "Profile image uploaded successfully",
      publicUrl: uploadResult.publicUrl,
      fileName: uploadResult.fileName,
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
    const { data: userProfileForDelete, error: profileError } = await supabase
      .from("user_profiles")
      .select("user_type")
      .eq("user_id", userId)
      .single();

    if (profileError) {
      return res.status(500).json({ error: "Error fetching user profile" });
    }

    // Use the shared service to handle profile image deletion
    const deleteResult = await deleteProfileImageService(
      userId,
      userProfileForDelete.user_type,
    );

    if (!deleteResult.success) {
      return res.status(500).json({ error: deleteResult.error });
    }

    res.status(200).json({
      message: "Profile image deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete profile image error:", error);
    res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};
