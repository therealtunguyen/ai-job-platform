export interface Job {
  id: string;
  title: string;
  description: string;
  company_name: string;
  location?: string;
  salary_min?: number;
  salary_max?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateJobDTO {
  title: string;
  description: string;
  company_name: string;
  location?: string;
  salary_min?: number;
  salary_max?: number;
}

export interface UpdateJobDTO extends Partial<CreateJobDTO> {}
