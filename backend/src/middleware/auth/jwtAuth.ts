import { Request, Response, NextFunction } from "express";
import { supabase } from "../../supabaseClient";
import { verifyToken } from "../../services/auth/authService";

// Optional JWT authentication middleware - sets req.user if token is valid, but doesn't fail if missing
export const optionalAuthenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      // No token provided, continue without user
      return next();
    }

    const { user, error } = await verifyToken(token);

    if (error || !user) {
      // Invalid token, continue without user
      return next();
    }

    // Add user to request object
    (req as any).user = user;

    // Get user type from the database
    if (user.id) {
      const { data: userProfile, error: profileError } = await supabase
        .from("user_profiles")
        .select("user_type")
        .eq("user_id", user.id)
        .single();

      if (!profileError && userProfile) {
        (req as any).user.user_type = userProfile.user_type;
      }
    }

    next();
  } catch (error: any) {
    // On error, continue without user
    next();
  }
};

// JWT authentication middleware
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: "Access token required" });
    }

    // Verify the token
    const { user, error } = await verifyToken(token);

    if (error || !user) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    // Add user to request object for use in route handlers
    (req as any).user = user;

    // Get user type from the database to make it available in request handlers
    if (user.id) {
      const { data: userProfile, error: profileError } = await supabase
        .from("user_profiles")
        .select("user_type")
        .eq("user_id", user.id)
        .single();

      if (!profileError && userProfile) {
        (req as any).user.user_type = userProfile.user_type;
      }
    }

    next();
  } catch (error: any) {
    console.error("Authentication error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
