export enum JobStatus {
  Bookmarked = "Bookmarked",
  Applied = "Applied",
  Screening = "Screening",
  Interviewing = "Interviewing",
  Offer = "Offer",
  Rejected = "Rejected",
  Ghosted = "Ghosted",
}

export interface Job {
  id: string;
  company: string;
  position: string;
  status: JobStatus;
  location?: string;
  salary?: string;
  dateApplied?: string;
  jobUrl?: string;
  benefits?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobInput {
  company: string;
  position: string;
  status: JobStatus;
  location?: string;
  salary?: string;
  dateApplied?: string;
  jobUrl?: string;
  benefits?: string;
  notes?: string;
}

export interface UpdateJobInput extends Partial<CreateJobInput> {}

export interface AuthSession {
  user: {
    id: string;
    email: string;
    name?: string;
    image?: string;
  } | null;
  session: {
    id: string;
    expiresAt: string;
    token: string;
  } | null;
}

export interface DashboardStats {
  total: number;
  activePipeline: number;
  thisWeek: number;
  offers: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
