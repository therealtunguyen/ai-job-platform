import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../../types/supabase";

type CandidateSearchFilters = {
  q?: string;
  skills?: string[];
  min_exp?: number;
  max_exp?: number;
  preferred_location?: string;
  page?: number;
  per_page?: number;
  sort?: string;
};

type CandidateSearchResult = {
  user_id: string | null;
  full_name: string | null;
  summary: string | null;
  preferred_location: string | null;
  total_experience_years: number | null;
  skills_list: string | null;
  match_score: number;
  profile_picture: string | null;
  status: Database["public"]["Enums"]["profile_status_enum"] | null;
};

export class CandidateSearchService {
  private supabase: SupabaseClient<Database>;

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase;
  }

  private escapeLikePattern(value: string): string {
    // Escape % and _ characters for SQL LIKE patterns
    return value.replace(/%/g, "\\%").replace(/_/g, "\\_");
  }

  private applyFilters(filters: CandidateSearchFilters, query: any) {
    if (filters.q && filters.q.trim() !== "") {
      query = query.textSearch("search_vector", filters.q, {
        type: "websearch",
      });
    }

    if (filters.min_exp !== undefined) {
      query = query.gte("total_experience_years", filters.min_exp);
    }

    if (filters.max_exp !== undefined) {
      query = query.lte("total_experience_years", filters.max_exp);
    }

    if (
      filters.preferred_location &&
      filters.preferred_location.trim() !== ""
    ) {
      const escapedLocation = this.escapeLikePattern(
        filters.preferred_location,
      );
      query = query.ilike("preferred_location", `%${escapedLocation}%`);
    }

    if (filters.skills && filters.skills.length > 0) {
      // Check if all specified skills are present in the skills_list
      for (const skill of filters.skills) {
        const escapedSkill = this.escapeLikePattern(skill);
        query = query.ilike("skills_list", `%${escapedSkill}%`);
      }
    }

    return query;
  }

  async searchCandidates(filters: CandidateSearchFilters) {
    // Set default values
    const page = Math.max(1, filters.page || 1);
    const per_page = Math.min(100, Math.max(1, filters.per_page || 20));
    const offset = (page - 1) * per_page;

    // Build the base query
    let query = this.supabase.from("job_seekers_with_skills").select(`
        user_id,
        full_name,
        summary,
        preferred_location,
        total_experience_years,
        skills_list,
        profile_picture,
        status
      `);

    // Apply filters using the helper method
    query = this.applyFilters(filters, query);

    // Build count query with conditional filters
    let countQuery = this.supabase
      .from("job_seekers_with_skills")
      .select("*", { count: "exact", head: true });

    // Apply the same filters to the count query
    countQuery = this.applyFilters(filters, countQuery);

    const { count, error: countError } = await countQuery;

    if (countError) {
      throw new Error(`Count query error: ${countError.message}`);
    }

    // Execute main query with pagination
    const { data, error } = await query.range(offset, offset + per_page - 1);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // Calculate match scores for each result
    const resultsWithScores = data.map((item) => {
      let score = 0;

      // Keyword matching score
      if (filters.q) {
        const q = filters.q.toLowerCase();
        const fullName = item.full_name?.toLowerCase() || "";
        const summary = item.summary?.toLowerCase() || "";
        const location = item.preferred_location?.toLowerCase() || "";

        if (fullName.includes(q)) {
          score += 0.4; // High weight for name match
        }
        if (summary.includes(q)) {
          score += 0.3; // Medium weight for summary match
        }
        if (location.includes(q)) {
          score += 0.2; // Lower weight for location match
        }
      }

      // Skills matching score
      if (filters.skills && filters.skills.length > 0) {
        const seekerSkills = (item.skills_list || "")
          .toLowerCase()
          .split(",")
          .map((s) => s.trim());
        const matchedSkills = filters.skills.filter((skill) =>
          seekerSkills.some(
            (s) =>
              s.includes(skill.toLowerCase()) ||
              skill.toLowerCase().includes(s),
          ),
        );
        if (matchedSkills.length > 0) {
          score += 0.2 * (matchedSkills.length / filters.skills.length); // Proportional to match ratio
        }
      }

      // Location matching score bonus
      if (
        filters.preferred_location &&
        item.preferred_location
          ?.toLowerCase()
          .includes(filters.preferred_location.toLowerCase())
      ) {
        score += 0.15; // Bonus for location match
      }

      // Experience matching - bonus if within range
      if (filters.min_exp !== undefined || filters.max_exp !== undefined) {
        let expScore = 0;
        if (
          filters.min_exp !== undefined &&
          item.total_experience_years !== null &&
          item.total_experience_years >= filters.min_exp
        )
          expScore += 0.05;
        if (
          filters.max_exp !== undefined &&
          item.total_experience_years !== null &&
          item.total_experience_years <= filters.max_exp
        )
          expScore += 0.05;
        score += expScore;
      }

      // Final score between 0 and 1
      score = Math.min(1, Math.max(0, score)); // Ensure score is between 0 and 1

      return {
        ...item,
        match_score: parseFloat(score.toFixed(4)), // Round to 4 decimal places
      };
    });

    // Sort based on sort parameter
    const sortedResults = this.sortResults(resultsWithScores, filters.sort);

    return {
      data: sortedResults,
      pagination: {
        current_page: page,
        per_page,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / per_page),
      },
    };
  }

  private sortResults(results: CandidateSearchResult[], sort?: string) {
    switch (sort) {
      case "relevance":
        return results.sort((a, b) => b.match_score - a.match_score);
      case "exp_high":
        return results.sort(
          (a, b) =>
            (b.total_experience_years || 0) - (a.total_experience_years || 0),
        );
      case "exp_low":
        return results.sort(
          (a, b) =>
            (a.total_experience_years || 0) - (b.total_experience_years || 0),
        );
      case "name":
        return results.sort((a, b) =>
          (a.full_name || "").localeCompare(b.full_name || ""),
        );
      default:
        // Default is by relevance score
        return results.sort((a, b) => b.match_score - a.match_score);
    }
  }
}
