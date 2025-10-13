import { Router } from "express";
import { JobSeekerProfileController } from "../controllers/jobSeekerProfileController";
import { supabase } from "../supabaseClient";
import { authenticateToken } from "../middleware/auth/jwtAuth";

const router = Router();
const jobSeekerProfileController = new JobSeekerProfileController(supabase);

// Middleware to check if user is authenticated as a job seeker
const requireJobSeeker = (req: any, res: any, next: any) => {
  // This relies on the authenticateToken middleware that adds user info to req
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  // Check if the user is a job seeker
  if (req.user.user_type !== "JOB_SEEKER") {
    return res.status(403).json({ error: "Access denied. Job seekers only." });
  }

  next();
};

// Routes for languages
router.get(
  "/languages",
  authenticateToken,
  requireJobSeeker,
  jobSeekerProfileController.getLanguages.bind(jobSeekerProfileController),
);
router.post(
  "/languages",
  authenticateToken,
  requireJobSeeker,
  jobSeekerProfileController.addLanguage.bind(jobSeekerProfileController),
);
router.delete(
  "/languages/:languageId",
  authenticateToken,
  requireJobSeeker,
  jobSeekerProfileController.removeLanguage.bind(jobSeekerProfileController),
);

// Routes for social networks
router.get(
  "/social-networks/available",
  jobSeekerProfileController.getAvailableSocialNetworks.bind(
    jobSeekerProfileController,
  ),
);
router.get(
  "/social-networks",
  authenticateToken,
  requireJobSeeker,
  jobSeekerProfileController.getSocialNetworks.bind(jobSeekerProfileController),
);
router.post(
  "/social-networks",
  authenticateToken,
  requireJobSeeker,
  jobSeekerProfileController.addSocialNetwork.bind(jobSeekerProfileController),
);
router.put(
  "/social-networks/:socialNetworkId",
  authenticateToken,
  requireJobSeeker,
  jobSeekerProfileController.updateSocialNetwork.bind(
    jobSeekerProfileController,
  ),
);
router.delete(
  "/social-networks/:socialNetworkId",
  authenticateToken,
  requireJobSeeker,
  jobSeekerProfileController.removeSocialNetwork.bind(
    jobSeekerProfileController,
  ),
);

export default router;
