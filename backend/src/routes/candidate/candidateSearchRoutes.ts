import express from "express";
import { CandidateSearchController } from "../../controllers/candidate/candidateSearchController";
import { candidateSearchValidator } from "../../middleware/validation/candidateSearchValidation";
import { authenticateToken } from "../../middleware/auth/jwtAuth";

const router = express.Router();
const candidateSearchController = new CandidateSearchController();

// Route for searching candidates - only accessible to authenticated users (recruiters)
router.get(
  "/",
  authenticateToken,
  candidateSearchValidator,
  candidateSearchController.searchCandidates.bind(candidateSearchController),
);

export default router;
