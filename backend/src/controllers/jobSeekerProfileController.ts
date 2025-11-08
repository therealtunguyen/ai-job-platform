import { Request, Response } from "express";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";

export class JobSeekerProfileController {
  constructor(private supabase: SupabaseClient<Database>) {}

  // GET /api/jobseekers/languages - Get job seeker's languages
  async getLanguages(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id; // Assuming authentication middleware adds user to req
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const { data, error } = await this.supabase
        .from("job_seeker_languages")
        .select(
          `
          language_id,
          added_at,
          language:language!inner (
            name,
            code,
            direction
          )
        `,
        )
        .eq("job_seeker_id", userId);

      if (error) {
        console.error("Error fetching languages:", error);
        return res.status(500).json({ error: error.message });
      }

      res.json({ languages: data });
    } catch (error) {
      console.error("Error in getLanguages:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // POST /api/jobseekers/languages - Add a language for job seeker
  async addLanguage(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id; // Assuming authentication middleware adds user to req
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const { language_id } = req.body;
      if (!language_id) {
        return res.status(400).json({ error: "language_id is required" });
      }

      // First check if the language exists
      const { data: languageExists, error: langError } = await this.supabase
        .from("language")
        .select("language_id")
        .eq("language_id", language_id)
        .single();

      if (langError || !languageExists) {
        return res.status(404).json({ error: "Language not found" });
      }

      // Check if the language is already added by this user
      const { data: existing } = await this.supabase
        .from("job_seeker_languages")
        .select("*")
        .eq("job_seeker_id", userId)
        .eq("language_id", language_id);

      if (existing && existing.length > 0) {
        return res.status(409).json({ error: "Language already added" });
      }

      const { data, error } = await this.supabase
        .from("job_seeker_languages")
        .insert([
          {
            job_seeker_id: userId,
            language_id,
            added_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) {
        console.error("Error adding language:", error);
        return res.status(500).json({ error: error.message });
      }

      res.status(201).json({ language: data[0] });
    } catch (error) {
      console.error("Error in addLanguage:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // DELETE /api/jobseekers/languages/:languageId - Remove a language for job seeker
  async removeLanguage(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id; // Assuming authentication middleware adds user to req
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const { languageId } = req.params;
      if (!languageId) {
        return res.status(400).json({ error: "languageId is required" });
      }

      const { error } = await this.supabase
        .from("job_seeker_languages")
        .delete()
        .eq("job_seeker_id", userId)
        .eq("language_id", languageId);

      if (error) {
        console.error("Error removing language:", error);
        return res.status(500).json({ error: error.message });
      }

      res.status(200).json({ message: "Language removed successfully" });
    } catch (error) {
      console.error("Error in removeLanguage:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // GET /api/jobseekers/social-networks/available - Get available social networks
  async getAvailableSocialNetworks(req: Request, res: Response) {
    try {
      const { data, error } = await this.supabase
        .from("social_networks")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching available social networks:", error);
        return res.status(500).json({ error: error.message });
      }

      res.json({ social_networks: data });
    } catch (error) {
      console.error("Error in getAvailableSocialNetworks:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // GET /api/jobseekers/social-networks - Get job seeker's social networks
  async getSocialNetworks(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id; // Assuming authentication middleware adds user to req
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const { data, error } = await this.supabase
        .from("job_seeker_social_networks")
        .select(
          `
          social_network_id,
          username,
          profile_url,
          added_at,
          social_network:social_networks!inner (
            name,
            code,
            base_url,
            icon_url
          )
        `,
        )
        .eq("job_seeker_id", userId);

      if (error) {
        console.error("Error fetching social networks:", error);
        return res.status(500).json({ error: error.message });
      }

      res.json({ social_networks: data });
    } catch (error) {
      console.error("Error in getSocialNetworks:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // POST /api/jobseekers/social-networks - Add a social network for job seeker
  async addSocialNetwork(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id; // Assuming authentication middleware adds user to req
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const { social_network_id, username, profile_url } = req.body;
      if (!social_network_id) {
        return res.status(400).json({ error: "social_network_id is required" });
      }

      // First check if the social network exists
      const { data: socialNetworkExists, error: snError } = await this.supabase
        .from("social_networks")
        .select("social_network_id")
        .eq("social_network_id", social_network_id)
        .single();

      if (snError || !socialNetworkExists) {
        return res.status(404).json({ error: "Social network not found" });
      }

      // Check if the social network is already added by this user
      const { data: existing } = await this.supabase
        .from("job_seeker_social_networks")
        .select("*")
        .eq("job_seeker_id", userId)
        .eq("social_network_id", social_network_id);

      if (existing && existing.length > 0) {
        return res.status(409).json({ error: "Social network already added" });
      }

      const { data, error } = await this.supabase
        .from("job_seeker_social_networks")
        .insert([
          {
            job_seeker_id: userId,
            social_network_id,
            username: username || null,
            profile_url: profile_url || null,
            added_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) {
        console.error("Error adding social network:", error);
        return res.status(500).json({ error: error.message });
      }

      res.status(201).json({ social_network: data[0] });
    } catch (error) {
      console.error("Error in addSocialNetwork:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // PUT /api/jobseekers/social-networks/:socialNetworkId - Update a social network for job seeker
  async updateSocialNetwork(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id; // Assuming authentication middleware adds user to req
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const { socialNetworkId } = req.params;
      if (!socialNetworkId) {
        return res.status(400).json({ error: "socialNetworkId is required" });
      }

      const { username, profile_url } = req.body;
      if (username === undefined && profile_url === undefined) {
        return res.status(400).json({
          error: "At least one field (username or profile_url) is required",
        });
      }

      const { data, error } = await this.supabase
        .from("job_seeker_social_networks")
        .update({
          username: username !== undefined ? username : undefined,
          profile_url: profile_url !== undefined ? profile_url : undefined,
        })
        .eq("job_seeker_id", userId)
        .eq("social_network_id", socialNetworkId)
        .select();

      if (error) {
        console.error("Error updating social network:", error);
        return res.status(500).json({ error: error.message });
      }

      if (!data || data.length === 0) {
        return res.status(404).json({ error: "Social network not found" });
      }

      res.json({ social_network: data[0] });
    } catch (error) {
      console.error("Error in updateSocialNetwork:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // DELETE /api/jobseekers/social-networks/:socialNetworkId - Remove a social network for job seeker
  async removeSocialNetwork(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id; // Assuming authentication middleware adds user to req
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const { socialNetworkId } = req.params;
      if (!socialNetworkId) {
        return res.status(400).json({ error: "socialNetworkId is required" });
      }

      const { error } = await this.supabase
        .from("job_seeker_social_networks")
        .delete()
        .eq("job_seeker_id", userId)
        .eq("social_network_id", socialNetworkId);

      if (error) {
        console.error("Error removing social network:", error);
        return res.status(500).json({ error: error.message });
      }

      res.status(200).json({
        message: "Social network removed successfully",
      });
    } catch (error) {
      console.error("Error in removeSocialNetwork:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
