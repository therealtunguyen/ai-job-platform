export interface JobFormData {
  title: string;
  location: string;
  job_type: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | "TEMPORARY";
  min_experience: number | null;
  max_experience: number | null;
  min_salary: number | null;
  max_salary: number | null;
  description: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "EXPIRED" | "FILLED" | "ARCHIVED";
  employer_id: string;
  posted_at?: string;
  expires_at?: string;
  last_updated_at?: string;
}

export interface JobStepperData {
  step1: {
    title: string;
    location: string;
  };
  step2: {
    job_type:
      | "FULL_TIME"
      | "PART_TIME"
      | "CONTRACT"
      | "INTERNSHIP"
      | "TEMPORARY";
    min_experience: number | null;
    max_experience: number | null;
    min_salary: number | null;
    max_salary: number | null;
  };
  step3: {
    description: string;
    responsibilities: string;
    requirements: string;
    benefits: string;
  };
  step4: {
    confirm: boolean;
  };
}

export interface JobCardProps {
  job: JobFormData;
  onEdit: (jobId: string) => void;
  onPauseResume: (jobId: string) => void;
  onClose: (jobId: string) => void;
  onDuplicate: (jobId: string) => void;
  onViewAnalytics: (jobId: string) => void;
}
