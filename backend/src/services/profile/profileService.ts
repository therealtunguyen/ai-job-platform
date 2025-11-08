import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../../types/supabase";

interface EducationInput {
  institution: string;
  degree?: string | null;
  major?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  grade?: string | null;
  description?: string | null;
}

interface CertificationInput {
  name: string;
  issuer?: string | null;
  issued_date?: string | null;
  expiry_date?: string | null;
}

interface WorkExperienceInput {
  company_name: string;
  position: string;
  start_date?: string | null;
  end_date?: string | null;
  description?: string | null;
  is_current?: boolean;
}

export class ProfileService {
  constructor(private supabase: SupabaseClient<Database>) {}

  // Education methods
  async getEducation(userId: string) {
    const { data, error } = await this.supabase
      .from("educations")
      .select("*")
      .eq("job_seeker_id", userId)
      .order("start_date", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async addEducation(userId: string, educationData: EducationInput) {
    const { data, error } = await this.supabase
      .from("educations")
      .insert([
        {
          job_seeker_id: userId,
          ...educationData,
        },
      ])
      .select();

    if (error) {
      throw new Error(error.message);
    }

    return data[0];
  }

  async updateEducation(
    userId: string,
    educationId: string,
    educationData: Partial<EducationInput>,
  ) {
    const { data, error } = await this.supabase
      .from("educations")
      .update(educationData)
      .eq("education_id", educationId)
      .eq("job_seeker_id", userId)
      .select();

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      return null;
    }

    return data[0];
  }

  async deleteEducation(userId: string, educationId: string) {
    const { error } = await this.supabase
      .from("educations")
      .delete()
      .eq("education_id", educationId)
      .eq("job_seeker_id", userId);

    if (error) {
      throw new Error(error.message);
    }

    return true;
  }

  // Certification methods
  async getCertifications(userId: string) {
    const { data, error } = await this.supabase
      .from("certifications")
      .select("*")
      .eq("job_seeker_id", userId)
      .order("issued_date", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async addCertification(
    userId: string,
    certificationData: CertificationInput,
  ) {
    const { data, error } = await this.supabase
      .from("certifications")
      .insert([
        {
          job_seeker_id: userId,
          ...certificationData,
        },
      ])
      .select();

    if (error) {
      throw new Error(error.message);
    }

    return data[0];
  }

  async updateCertification(
    userId: string,
    certId: string,
    certificationData: Partial<CertificationInput>,
  ) {
    const { data, error } = await this.supabase
      .from("certifications")
      .update(certificationData)
      .eq("cert_id", certId)
      .eq("job_seeker_id", userId)
      .select();

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      return null;
    }

    return data[0];
  }

  async deleteCertification(userId: string, certId: string) {
    const { error } = await this.supabase
      .from("certifications")
      .delete()
      .eq("cert_id", certId)
      .eq("job_seeker_id", userId);

    if (error) {
      throw new Error(error.message);
    }

    return true;
  }

  // Work experience methods
  async getWorkExperiences(userId: string) {
    const { data, error } = await this.supabase
      .from("work_experiences")
      .select("*")
      .eq("job_seeker_id", userId)
      .order("start_date", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async addWorkExperience(
    userId: string,
    workExperienceData: WorkExperienceInput,
  ) {
    const { data, error } = await this.supabase
      .from("work_experiences")
      .insert([
        {
          job_seeker_id: userId,
          ...workExperienceData,
        },
      ])
      .select();

    if (error) {
      throw new Error(error.message);
    }

    return data[0];
  }

  async updateWorkExperience(
    userId: string,
    experienceId: string,
    workExperienceData: Partial<WorkExperienceInput>,
  ) {
    const { data, error } = await this.supabase
      .from("work_experiences")
      .update(workExperienceData)
      .eq("experience_id", experienceId)
      .eq("job_seeker_id", userId)
      .select();

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      return null;
    }

    return data[0];
  }

  async deleteWorkExperience(userId: string, experienceId: string) {
    const { error } = await this.supabase
      .from("work_experiences")
      .delete()
      .eq("experience_id", experienceId)
      .eq("job_seeker_id", userId);

    if (error) {
      throw new Error(error.message);
    }

    return true;
  }
}
