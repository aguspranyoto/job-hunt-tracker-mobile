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

export const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  [JobStatus.Bookmarked]: "#3b82f6",
  [JobStatus.Applied]: "#6366f1",
  [JobStatus.Screening]: "#f59e0b",
  [JobStatus.Interviewing]: "#8b5cf6",
  [JobStatus.Offer]: "#10b981",
  [JobStatus.Rejected]: "#ef4444",
  [JobStatus.Ghosted]: "#71717a",
};

export const JOB_STATUS_BG_COLORS: Record<JobStatus, string> = {
  [JobStatus.Bookmarked]: "#eff6ff",
  [JobStatus.Applied]: "#eef2ff",
  [JobStatus.Screening]: "#fefce8",
  [JobStatus.Interviewing]: "#faf5ff",
  [JobStatus.Offer]: "#ecfdf5",
  [JobStatus.Rejected]: "#fef2f2",
  [JobStatus.Ghosted]: "#f4f4f5",
};

export const JOB_STATUS_DARK_BG_COLORS: Record<JobStatus, string> = {
  [JobStatus.Bookmarked]: "#1e3a5f",
  [JobStatus.Applied]: "#312e81",
  [JobStatus.Screening]: "#713f12",
  [JobStatus.Interviewing]: "#4c1d95",
  [JobStatus.Offer]: "#064e3b",
  [JobStatus.Rejected]: "#7f1d1d",
  [JobStatus.Ghosted]: "#3f3f46",
};

export const STAT_CARD_COLORS: Record<string, string> = {
  total: "#3b82f6",
  pipeline: "#8b5cf6",
  week: "#f59e0b",
  offers: "#10b981",
};

export const STAT_CARD_BG_COLORS: Record<string, string> = {
  total: "#eff6ff",
  pipeline: "#faf5ff",
  week: "#fefce8",
  offers: "#ecfdf5",
};
