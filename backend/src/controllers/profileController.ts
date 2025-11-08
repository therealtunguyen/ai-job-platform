import { Request, Response } from "express";
import { ProfileService } from "../services/profile/profileService";

export class ProfileController {
  constructor(private profileService: ProfileService) {}

  // GET /api/profile/education - Get job seeker's education
  async getEducation(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const education = await this.profileService.getEducation(userId);
      res.json({ education });
    } catch (error: any) {
      console.error("Error in getEducation:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  // POST /api/profile/education - Add education for job seeker
  async addEducation(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const {
        institution,
        degree,
        major,
        start_date,
        end_date,
        grade,
        description,
      } = req.body;

      // Validate required fields
      if (!institution) {
        return res.status(400).json({ error: "Institution is required" });
      }

      const education = await this.profileService.addEducation(userId, {
        institution,
        degree: degree || null,
        major: major || null,
        start_date: start_date || null,
        end_date: end_date || null,
        grade: grade || null,
        description: description || null,
      });

      res.status(201).json({ education });
    } catch (error: any) {
      console.error("Error in addEducation:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  // PUT /api/profile/education/:educationId - Update education for job seeker
  async updateEducation(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const { educationId } = req.params;
      if (!educationId) {
        return res.status(400).json({ error: "Education ID is required" });
      }

      const {
        institution,
        degree,
        major,
        start_date,
        end_date,
        grade,
        description,
      } = req.body;

      const updatedEducation = await this.profileService.updateEducation(
        userId,
        educationId,
        {
          institution: institution || null,
          degree: degree || null,
          major: major || null,
          start_date: start_date || null,
          end_date: end_date || null,
          grade: grade || null,
          description: description || null,
        },
      );

      if (!updatedEducation) {
        return res.status(404).json({ error: "Education record not found" });
      }

      res.json({ education: updatedEducation });
    } catch (error: any) {
      console.error("Error in updateEducation:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  // DELETE /api/profile/education/:educationId - Delete education for job seeker
  async deleteEducation(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const { educationId } = req.params;
      if (!educationId) {
        return res.status(400).json({ error: "Education ID is required" });
      }

      await this.profileService.deleteEducation(userId, educationId);
      res.status(200).json({ message: "Education deleted successfully" });
    } catch (error: any) {
      console.error("Error in deleteEducation:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  // GET /api/profile/certifications - Get job seeker's certifications
  async getCertifications(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const certifications =
        await this.profileService.getCertifications(userId);
      res.json({ certifications });
    } catch (error: any) {
      console.error("Error in getCertifications:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  // POST /api/profile/certifications - Add certification for job seeker
  async addCertification(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const { name, issuer, issued_date, expiry_date } = req.body;

      // Validate required fields
      if (!name) {
        return res
          .status(400)
          .json({ error: "Certification name is required" });
      }

      const certification = await this.profileService.addCertification(userId, {
        name,
        issuer: issuer || null,
        issued_date: issued_date || null,
        expiry_date: expiry_date || null,
      });

      res.status(201).json({ certification });
    } catch (error: any) {
      console.error("Error in addCertification:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  // PUT /api/profile/certifications/:certId - Update certification for job seeker
  async updateCertification(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const { certId } = req.params;
      if (!certId) {
        return res.status(400).json({ error: "Certification ID is required" });
      }

      const { name, issuer, issued_date, expiry_date } = req.body;

      const updatedCertification =
        await this.profileService.updateCertification(userId, certId, {
          name: name || undefined,
          issuer: issuer || undefined,
          issued_date: issued_date || undefined,
          expiry_date: expiry_date || undefined,
        });

      if (!updatedCertification) {
        return res.status(404).json({ error: "Certification not found" });
      }

      res.json({ certification: updatedCertification });
    } catch (error: any) {
      console.error("Error in updateCertification:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  // DELETE /api/profile/certifications/:certId - Delete certification for job seeker
  async deleteCertification(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const { certId } = req.params;
      if (!certId) {
        return res.status(400).json({ error: "Certification ID is required" });
      }

      await this.profileService.deleteCertification(userId, certId);
      res.status(200).json({ message: "Certification deleted successfully" });
    } catch (error: any) {
      console.error("Error in deleteCertification:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  // GET /api/profile/work-experiences - Get job seeker's work experiences
  async getWorkExperiences(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const workExperiences =
        await this.profileService.getWorkExperiences(userId);
      res.json({ work_experiences: workExperiences });
    } catch (error: any) {
      console.error("Error in getWorkExperiences:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  // POST /api/profile/work-experiences - Add work experience for job seeker
  async addWorkExperience(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const {
        company_name,
        position,
        start_date,
        end_date,
        description,
        is_current,
      } = req.body;

      // Validate required fields
      if (!company_name || !position) {
        return res
          .status(400)
          .json({ error: "Company name and position are required" });
      }

      const workExperience = await this.profileService.addWorkExperience(
        userId,
        {
          company_name,
          position,
          start_date: start_date || null,
          end_date: end_date || null,
          description: description || null,
          is_current: is_current || false,
        },
      );

      res.status(201).json({ work_experience: workExperience });
    } catch (error: any) {
      console.error("Error in addWorkExperience:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  // PUT /api/profile/work-experiences/:experienceId - Update work experience for job seeker
  async updateWorkExperience(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const { experienceId } = req.params;
      if (!experienceId) {
        return res.status(400).json({ error: "Experience ID is required" });
      }

      const {
        company_name,
        position,
        start_date,
        end_date,
        description,
        is_current,
      } = req.body;

      const updatedWorkExperience =
        await this.profileService.updateWorkExperience(userId, experienceId, {
          company_name: company_name || undefined,
          position: position || undefined,
          start_date: start_date || undefined,
          end_date: end_date || undefined,
          description: description || undefined,
          is_current: is_current !== undefined ? is_current : undefined,
        });

      if (!updatedWorkExperience) {
        return res.status(404).json({ error: "Work experience not found" });
      }

      res.json({ work_experience: updatedWorkExperience });
    } catch (error: any) {
      console.error("Error in updateWorkExperience:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }

  // DELETE /api/profile/work-experiences/:experienceId - Delete work experience for job seeker
  async deleteWorkExperience(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const { experienceId } = req.params;
      if (!experienceId) {
        return res.status(400).json({ error: "Experience ID is required" });
      }

      await this.profileService.deleteWorkExperience(userId, experienceId);
      res.status(200).json({ message: "Work experience deleted successfully" });
    } catch (error: any) {
      console.error("Error in deleteWorkExperience:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  }
}
