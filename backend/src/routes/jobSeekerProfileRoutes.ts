import { Router } from "express";
import { JobSeekerProfileController } from "../controllers/jobSeekerProfileController";
import { ProfileController } from "../controllers/profileController";
import { supabase } from "../supabaseClient";
import { authenticateToken } from "../middleware/auth/jwtAuth";
import { ProfileService } from "../services/profile/profileService";

const router = Router();
const jobSeekerProfileController = new JobSeekerProfileController(supabase);
const profileService = new ProfileService(supabase);
const profileController = new ProfileController(profileService);

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

// Education routes
router.get(
  "/education",
  authenticateToken,
  requireJobSeeker,
  profileController.getEducation.bind(profileController),
);
router.post(
  "/education",
  authenticateToken,
  requireJobSeeker,
  profileController.addEducation.bind(profileController),
);
router.put(
  "/education/:educationId",
  authenticateToken,
  requireJobSeeker,
  profileController.updateEducation.bind(profileController),
);
router.delete(
  "/education/:educationId",
  authenticateToken,
  requireJobSeeker,
  profileController.deleteEducation.bind(profileController),
);

// Certification routes
router.get(
  "/certifications",
  authenticateToken,
  requireJobSeeker,
  profileController.getCertifications.bind(profileController),
);
router.post(
  "/certifications",
  authenticateToken,
  requireJobSeeker,
  profileController.addCertification.bind(profileController),
);
router.put(
  "/certifications/:certId",
  authenticateToken,
  requireJobSeeker,
  profileController.updateCertification.bind(profileController),
);
router.delete(
  "/certifications/:certId",
  authenticateToken,
  requireJobSeeker,
  profileController.deleteCertification.bind(profileController),
);

// Work experience routes
router.get(
  "/work-experiences",
  authenticateToken,
  requireJobSeeker,
  profileController.getWorkExperiences.bind(profileController),
);
router.post(
  "/work-experiences",
  authenticateToken,
  requireJobSeeker,
  profileController.addWorkExperience.bind(profileController),
);
router.put(
  "/work-experiences/:experienceId",
  authenticateToken,
  requireJobSeeker,
  profileController.updateWorkExperience.bind(profileController),
);
router.delete(
  "/work-experiences/:experienceId",
  authenticateToken,
  requireJobSeeker,
  profileController.deleteWorkExperience.bind(profileController),
);

export default router;
