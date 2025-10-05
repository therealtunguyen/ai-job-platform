export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      applications: {
        Row: {
          application_id: string
          applied_at: string | null
          candidate_id: string
          job_id: string
          status: Database["public"]["Enums"]["application_status_enum"] | null
          status_updated_at: string | null
        }
        Insert: {
          application_id?: string
          applied_at?: string | null
          candidate_id: string
          job_id: string
          status?: Database["public"]["Enums"]["application_status_enum"] | null
          status_updated_at?: string | null
        }
        Update: {
          application_id?: string
          applied_at?: string | null
          candidate_id?: string
          job_id?: string
          status?: Database["public"]["Enums"]["application_status_enum"] | null
          status_updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "job_seekers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["job_id"]
          },
        ]
      }
      certifications: {
        Row: {
          cert_id: string
          expiry_date: string | null
          issued_date: string | null
          issuer: string | null
          job_seeker_id: string
          name: string | null
        }
        Insert: {
          cert_id?: string
          expiry_date?: string | null
          issued_date?: string | null
          issuer?: string | null
          job_seeker_id: string
          name?: string | null
        }
        Update: {
          cert_id?: string
          expiry_date?: string | null
          issued_date?: string | null
          issuer?: string | null
          job_seeker_id?: string
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certifications_job_seeker_id_fkey"
            columns: ["job_seeker_id"]
            isOneToOne: false
            referencedRelation: "job_seekers"
            referencedColumns: ["user_id"]
          },
        ]
      }
      conversation_entries: {
        Row: {
          ai_evaluation_score: number | null
          ai_feedback: string | null
          difficulty: Database["public"]["Enums"]["difficulty_enum"] | null
          entry_id: string
          question_asked_at: string | null
          question_text: string | null
          question_type: string | null
          response_quality:
            | Database["public"]["Enums"]["response_quality_enum"]
            | null
          response_submitted_at: string | null
          response_text: string | null
          session_id: string
          suggested_improvements: string | null
          updated_at: string | null
        }
        Insert: {
          ai_evaluation_score?: number | null
          ai_feedback?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_enum"] | null
          entry_id?: string
          question_asked_at?: string | null
          question_text?: string | null
          question_type?: string | null
          response_quality?:
            | Database["public"]["Enums"]["response_quality_enum"]
            | null
          response_submitted_at?: string | null
          response_text?: string | null
          session_id: string
          suggested_improvements?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_evaluation_score?: number | null
          ai_feedback?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_enum"] | null
          entry_id?: string
          question_asked_at?: string | null
          question_text?: string | null
          question_type?: string | null
          response_quality?:
            | Database["public"]["Enums"]["response_quality_enum"]
            | null
          response_submitted_at?: string | null
          response_text?: string | null
          session_id?: string
          suggested_improvements?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_entries_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "mock_interviews"
            referencedColumns: ["session_id"]
          },
        ]
      }
      cvs: {
        Row: {
          cv_id: string
          extracted_text: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          job_seeker_id: string
          status: Database["public"]["Enums"]["cv_status_enum"] | null
          uploaded_at: string | null
        }
        Insert: {
          cv_id?: string
          extracted_text?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          job_seeker_id: string
          status?: Database["public"]["Enums"]["cv_status_enum"] | null
          uploaded_at?: string | null
        }
        Update: {
          cv_id?: string
          extracted_text?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          job_seeker_id?: string
          status?: Database["public"]["Enums"]["cv_status_enum"] | null
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cvs_job_seeker_id_fkey"
            columns: ["job_seeker_id"]
            isOneToOne: false
            referencedRelation: "job_seekers"
            referencedColumns: ["user_id"]
          },
        ]
      }
      educations: {
        Row: {
          degree: string | null
          description: string | null
          education_id: string
          end_date: string | null
          grade: string | null
          institution: string | null
          job_seeker_id: string
          major: string | null
          start_date: string | null
        }
        Insert: {
          degree?: string | null
          description?: string | null
          education_id?: string
          end_date?: string | null
          grade?: string | null
          institution?: string | null
          job_seeker_id: string
          major?: string | null
          start_date?: string | null
        }
        Update: {
          degree?: string | null
          description?: string | null
          education_id?: string
          end_date?: string | null
          grade?: string | null
          institution?: string | null
          job_seeker_id?: string
          major?: string | null
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "educations_job_seeker_id_fkey"
            columns: ["job_seeker_id"]
            isOneToOne: false
            referencedRelation: "job_seekers"
            referencedColumns: ["user_id"]
          },
        ]
      }
      employers: {
        Row: {
          address: string | null
          company_name: string | null
          contact_person: string | null
          description: string | null
          industry: string | null
          logo: string | null
          phone: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          company_name?: string | null
          contact_person?: string | null
          description?: string | null
          industry?: string | null
          logo?: string | null
          phone?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          company_name?: string | null
          contact_person?: string | null
          description?: string | null
          industry?: string | null
          logo?: string | null
          phone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      interview_feedback: {
        Row: {
          ai_suggestion: string | null
          created_at: string | null
          entry_id: string
          feedback_category: string | null
          feedback_id: string
          feedback_text: string | null
          max_score: number | null
          score_obtained: number | null
          session_id: string
          updated_at: string | null
        }
        Insert: {
          ai_suggestion?: string | null
          created_at?: string | null
          entry_id: string
          feedback_category?: string | null
          feedback_id?: string
          feedback_text?: string | null
          max_score?: number | null
          score_obtained?: number | null
          session_id: string
          updated_at?: string | null
        }
        Update: {
          ai_suggestion?: string | null
          created_at?: string | null
          entry_id?: string
          feedback_category?: string | null
          feedback_id?: string
          feedback_text?: string | null
          max_score?: number | null
          score_obtained?: number | null
          session_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interview_feedback_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "conversation_entries"
            referencedColumns: ["entry_id"]
          },
          {
            foreignKeyName: "interview_feedback_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "mock_interviews"
            referencedColumns: ["session_id"]
          },
        ]
      }
      job_matches: {
        Row: {
          candidate_id: string
          created_at: string | null
          job_id: string
          match_id: string
          match_score: number | null
        }
        Insert: {
          candidate_id: string
          created_at?: string | null
          job_id: string
          match_id?: string
          match_score?: number | null
        }
        Update: {
          candidate_id?: string
          created_at?: string | null
          job_id?: string
          match_id?: string
          match_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "job_matches_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "job_seekers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "job_matches_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["job_id"]
          },
        ]
      }
      job_required_skills: {
        Row: {
          is_mandatory: boolean | null
          job_id: string
          skill_id: string
        }
        Insert: {
          is_mandatory?: boolean | null
          job_id: string
          skill_id: string
        }
        Update: {
          is_mandatory?: boolean | null
          job_id?: string
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_required_skills_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_required_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["skill_id"]
          },
        ]
      }
      job_seeker_languages: {
        Row: {
          added_at: string | null
          job_seeker_id: string
          language_id: string
        }
        Insert: {
          added_at?: string | null
          job_seeker_id: string
          language_id: string
        }
        Update: {
          added_at?: string | null
          job_seeker_id?: string
          language_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_seeker_languages_job_seeker_id_fkey"
            columns: ["job_seeker_id"]
            isOneToOne: false
            referencedRelation: "job_seekers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "job_seeker_languages_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "language"
            referencedColumns: ["language_id"]
          },
        ]
      }
      job_seeker_skills: {
        Row: {
          added_at: string | null
          job_seeker_id: string
          skill_id: string
        }
        Insert: {
          added_at?: string | null
          job_seeker_id: string
          skill_id: string
        }
        Update: {
          added_at?: string | null
          job_seeker_id?: string
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_seeker_skills_job_seeker_id_fkey"
            columns: ["job_seeker_id"]
            isOneToOne: false
            referencedRelation: "job_seekers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "job_seeker_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["skill_id"]
          },
        ]
      }
      job_seeker_social_networks: {
        Row: {
          added_at: string | null
          job_seeker_id: string
          profile_url: string | null
          social_network_id: string
          username: string | null
        }
        Insert: {
          added_at?: string | null
          job_seeker_id: string
          profile_url?: string | null
          social_network_id: string
          username?: string | null
        }
        Update: {
          added_at?: string | null
          job_seeker_id?: string
          profile_url?: string | null
          social_network_id?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_seeker_social_networks_job_seeker_id_fkey"
            columns: ["job_seeker_id"]
            isOneToOne: false
            referencedRelation: "job_seekers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "job_seeker_social_networks_social_network_id_fkey"
            columns: ["social_network_id"]
            isOneToOne: false
            referencedRelation: "social_networks"
            referencedColumns: ["social_network_id"]
          },
        ]
      }
      job_seekers: {
        Row: {
          address: string | null
          cv_file_path: string | null
          expected_salary: number | null
          full_name: string | null
          last_updated: string | null
          phone: string | null
          preferred_location: string | null
          profile_picture: string | null
          status: Database["public"]["Enums"]["profile_status_enum"] | null
          summary: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          cv_file_path?: string | null
          expected_salary?: number | null
          full_name?: string | null
          last_updated?: string | null
          phone?: string | null
          preferred_location?: string | null
          profile_picture?: string | null
          status?: Database["public"]["Enums"]["profile_status_enum"] | null
          summary?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          cv_file_path?: string | null
          expected_salary?: number | null
          full_name?: string | null
          last_updated?: string | null
          phone?: string | null
          preferred_location?: string | null
          profile_picture?: string | null
          status?: Database["public"]["Enums"]["profile_status_enum"] | null
          summary?: string | null
          user_id?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          applicant_count: number | null
          description: string | null
          employer_id: string
          expires_at: string | null
          job_id: string
          job_type: string | null
          location: string | null
          max_experience: number | null
          max_salary: number | null
          min_experience: number | null
          min_salary: number | null
          posted_at: string | null
          status: Database["public"]["Enums"]["job_status_enum"] | null
          title: string
        }
        Insert: {
          applicant_count?: number | null
          description?: string | null
          employer_id: string
          expires_at?: string | null
          job_id?: string
          job_type?: string | null
          location?: string | null
          max_experience?: number | null
          max_salary?: number | null
          min_experience?: number | null
          min_salary?: number | null
          posted_at?: string | null
          status?: Database["public"]["Enums"]["job_status_enum"] | null
          title: string
        }
        Update: {
          applicant_count?: number | null
          description?: string | null
          employer_id?: string
          expires_at?: string | null
          job_id?: string
          job_type?: string | null
          location?: string | null
          max_experience?: number | null
          max_salary?: number | null
          min_experience?: number | null
          min_salary?: number | null
          posted_at?: string | null
          status?: Database["public"]["Enums"]["job_status_enum"] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["user_id"]
          },
        ]
      }
      language: {
        Row: {
          code: string
          created_at: string
          direction: string
          language_id: string
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          direction?: string
          language_id?: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          direction?: string
          language_id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      mock_interviews: {
        Row: {
          ai_raw_response: Json | null
          answered_questions: number | null
          candidate_id: string
          completed_at: string | null
          completion_percentage: number | null
          config: Json | null
          improvement_areas: string[] | null
          overall_feedback: string | null
          overall_score: number | null
          session_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["session_status_enum"] | null
          strengths: string[] | null
          total_questions: number | null
        }
        Insert: {
          ai_raw_response?: Json | null
          answered_questions?: number | null
          candidate_id: string
          completed_at?: string | null
          completion_percentage?: number | null
          config?: Json | null
          improvement_areas?: string[] | null
          overall_feedback?: string | null
          overall_score?: number | null
          session_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["session_status_enum"] | null
          strengths?: string[] | null
          total_questions?: number | null
        }
        Update: {
          ai_raw_response?: Json | null
          answered_questions?: number | null
          candidate_id?: string
          completed_at?: string | null
          completion_percentage?: number | null
          config?: Json | null
          improvement_areas?: string[] | null
          overall_feedback?: string | null
          overall_score?: number | null
          session_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["session_status_enum"] | null
          strengths?: string[] | null
          total_questions?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mock_interviews_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "job_seekers"
            referencedColumns: ["user_id"]
          },
        ]
      }
      skills: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          name: string
          skill_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          name: string
          skill_id?: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          name?: string
          skill_id?: string
        }
        Relationships: []
      }
      social_networks: {
        Row: {
          base_url: string | null
          code: string
          created_at: string
          icon_url: string | null
          metadata: Json | null
          name: string
          social_network_id: string
          updated_at: string
        }
        Insert: {
          base_url?: string | null
          code: string
          created_at?: string
          icon_url?: string | null
          metadata?: Json | null
          name: string
          social_network_id?: string
          updated_at?: string
        }
        Update: {
          base_url?: string | null
          code?: string
          created_at?: string
          icon_url?: string | null
          metadata?: Json | null
          name?: string
          social_network_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string | null
          is_active: boolean | null
          last_login: string | null
          user_id: string
          user_type: Database["public"]["Enums"]["user_type_enum"]
        }
        Insert: {
          created_at?: string | null
          is_active?: boolean | null
          last_login?: string | null
          user_id: string
          user_type: Database["public"]["Enums"]["user_type_enum"]
        }
        Update: {
          created_at?: string | null
          is_active?: boolean | null
          last_login?: string | null
          user_id?: string
          user_type?: Database["public"]["Enums"]["user_type_enum"]
        }
        Relationships: []
      }
      work_experiences: {
        Row: {
          company_name: string | null
          description: string | null
          end_date: string | null
          experience_id: string
          is_current: boolean | null
          job_seeker_id: string
          position: string | null
          start_date: string | null
        }
        Insert: {
          company_name?: string | null
          description?: string | null
          end_date?: string | null
          experience_id?: string
          is_current?: boolean | null
          job_seeker_id: string
          position?: string | null
          start_date?: string | null
        }
        Update: {
          company_name?: string | null
          description?: string | null
          end_date?: string | null
          experience_id?: string
          is_current?: boolean | null
          job_seeker_id?: string
          position?: string | null
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "work_experiences_job_seeker_id_fkey"
            columns: ["job_seeker_id"]
            isOneToOne: false
            referencedRelation: "job_seekers"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_type: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_type_enum"]
      }
      update_interview_metrics: {
        Args: { p_session_id: string }
        Returns: undefined
      }
    }
    Enums: {
      application_status_enum:
        | "SUBMITTED"
        | "REVIEWED"
        | "SHORTLISTED"
        | "INTERVIEWED"
        | "OFFERED"
        | "ACCEPTED"
        | "REJECTED"
        | "WITHDRAWN"
      cv_status_enum:
        | "UPLOADED"
        | "PROCESSING"
        | "PARSED"
        | "FAILED"
        | "ARCHIVED"
      difficulty_enum: "easy" | "medium" | "hard"
      job_status_enum:
        | "DRAFT"
        | "ACTIVE"
        | "PAUSED"
        | "EXPIRED"
        | "FILLED"
        | "ARCHIVED"
      profile_status_enum: "INCOMPLETE" | "COMPLETE" | "VERIFIED" | "SUSPENDED"
      response_quality_enum: "excellent" | "good" | "average" | "poor"
      session_status_enum: "STARTED" | "IN_PROGRESS" | "COMPLETED" | "ABANDONED"
      user_type_enum: "JOB_SEEKER" | "EMPLOYER"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      application_status_enum: [
        "SUBMITTED",
        "REVIEWED",
        "SHORTLISTED",
        "INTERVIEWED",
        "OFFERED",
        "ACCEPTED",
        "REJECTED",
        "WITHDRAWN",
      ],
      cv_status_enum: [
        "UPLOADED",
        "PROCESSING",
        "PARSED",
        "FAILED",
        "ARCHIVED",
      ],
      difficulty_enum: ["easy", "medium", "hard"],
      job_status_enum: [
        "DRAFT",
        "ACTIVE",
        "PAUSED",
        "EXPIRED",
        "FILLED",
        "ARCHIVED",
      ],
      profile_status_enum: ["INCOMPLETE", "COMPLETE", "VERIFIED", "SUSPENDED"],
      response_quality_enum: ["excellent", "good", "average", "poor"],
      session_status_enum: ["STARTED", "IN_PROGRESS", "COMPLETED", "ABANDONED"],
      user_type_enum: ["JOB_SEEKER", "EMPLOYER"],
    },
  },
} as const
