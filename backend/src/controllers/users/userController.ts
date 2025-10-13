import { Request, Response } from "express";
import { supabase } from "../../supabaseClient";

// Get user profile (requires authentication)
export const getUser = async (req: Request, res: Response) => {
  try {
    // The user is already attached to req by the authenticateToken middleware
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Fetch user profile based on user type
    // First get the user type from user_profiles table
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (profileError) {
      return res.status(404).json({ error: "User profile not found" });
    }

    let detailedProfile: any = null;

    if (userProfile.user_type === "JOB_SEEKER") {
      const { data: seekerData, error: seekerError } = await supabase
        .from("job_seekers")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (seekerError) {
        return res.status(404).json({ error: "Job seeker profile not found" });
      }
      detailedProfile = seekerData;
    } else if (userProfile.user_type === "EMPLOYER") {
      const { data: employerData, error: employerError } = await supabase
        .from("employers")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (employerError) {
        return res.status(404).json({ error: "Employer profile not found" });
      }
      detailedProfile = employerData;
    }

    res.status(200).json({
      user: userProfile,
      profile: detailedProfile,
    });
  } catch (error: any) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update user profile (requires authentication)
export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const updates = req.body;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Get user type to determine which profile table to update
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("user_type")
      .eq("user_id", userId)
      .single();

    if (profileError) {
      return res.status(404).json({ error: "User profile not found" });
    }

    let result: { data: any; error: any } | null = null;
    if (userProfile.user_type === "JOB_SEEKER") {
      const { data, error } = await supabase
        .from("job_seekers")
        .update(updates)
        .eq("user_id", userId)
        .select()
        .single();

      result = { data, error };
    } else if (userProfile.user_type === "EMPLOYER") {
      const { data, error } = await supabase
        .from("employers")
        .update(updates)
        .eq("user_id", userId)
        .select()
        .single();

      result = { data, error };
    }

    if (!result) {
      return res.status(400).json({ error: "Invalid user type" });
    }

    if (result.error) {
      return res.status(400).json({ error: result.error.message });
    }

    res.status(200).json({
      message: "User profile updated successfully",
      data: result.data,
    });
  } catch (error: any) {
    console.error("Update user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create user profile (this is now handled by auth service, so this is just a placeholder)
export const createUser = (req: Request, res: Response) => {
  res.status(400).json({
    error:
      "User creation is handled through registration. Use POST /api/auth/register instead.",
  });
};
