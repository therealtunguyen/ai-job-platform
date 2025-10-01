import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../../services/auth/authService";

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

        next();
    } catch (error: any) {
        console.error("Authentication error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
