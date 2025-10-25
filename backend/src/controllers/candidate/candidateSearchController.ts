import { Request, Response } from "express";
import { CandidateSearchService } from "../../services/candidate/candidateSearchService";
import { supabase } from "../../supabaseClient";

export class CandidateSearchController {
  private candidateSearchService: CandidateSearchService;

  constructor() {
    this.candidateSearchService = new CandidateSearchService(supabase);
  }

  async searchCandidates(req: Request, res: Response) {
    try {
      // Extract and parse query parameters
      const filters = {
        q: req.query.q as string,
        skills: req.query.skills
          ? (req.query.skills as string).split(",").map((s) => s.trim())
          : undefined,
        min_exp: req.query.min_exp as unknown as number,
        max_exp: req.query.max_exp as unknown as number,
        preferred_location: req.query.preferred_location as string,
        page: req.query.page as unknown as number,
        per_page: req.query.per_page as unknown as number,
        sort: req.query.sort as string,
      };

      // If skills was provided as an array, use it directly
      if (Array.isArray(req.query.skills)) {
        filters.skills = req.query.skills as string[];
      }

      const result =
        await this.candidateSearchService.searchCandidates(filters);

      res.json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      console.error("Error in candidate search:", error);
      res.status(500).json({
        success: false,
        error: "Failed to search candidates",
        message: error.message,
      });
    }
  }
}
