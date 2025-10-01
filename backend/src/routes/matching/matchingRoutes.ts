import express from "express";
import { getMatches } from "../../controllers/matching/matchingController";

const router = express.Router();

router.get("/:userId", getMatches);

export default router;
