/**
 * Spider - 前端类型定义
 * 与后端API类型对应
 */

export interface JDInfo {
  position_name: string;
  experience_required: number;
  education_required: string;
  skills_required: string[];
  industry_required: string[];
  responsibilities: string[];
  salary_range?: string;
  location?: string;
}

export interface ResumeInfo {
  candidate_name: string;
  current_position?: string;
  current_company?: string;
  years_experience?: number;
  education?: string;
  skills?: string[];
  industry_experience?: string[];
  key_projects?: string[];
  achievements?: string[];
  contact_info?: string;
}

export interface MatchScore {
  total_score: number;
  hard_fit_score: number;
  skill_score: number;
  industry_score: number;
  potential_score: number;
  match_details: string[];
}

export interface Candidate {
  candidate_name: string;
  match_score: number;
  level: "strong_recommend" | "backup" | "rejected";
  summary: string;
  current_company?: string;
  years_experience?: number;
  education?: string;
  skills?: string[];
  industry_experience?: string[];
}

export interface Report {
  position_name: string;
  jd_source: string;
  total_resumes: number;
  screened_resumes: number;
  strong_recommendations: Candidate[];
  backup_candidates: Candidate[];
  screening_criteria: string[];
  generated_at: string;
}

export interface ScreeningRequest {
  jd_url: string;
  jd_content?: string;
  resume_list: string[];
}

export interface ScreeningResponse {
  success: boolean;
  status: "success" | "error" | "partial";
  message: string;
  data?: {
    report: Report;
  };
  error?: {
    code: string;
    message: string;
    field?: string;
    details?: Record<string, any>;
  };
  request_id?: string;
  timestamp?: string;
}

export interface JDParseRequest {
  jd_text: string;
  source_url?: string;
}

export interface JDParseResponse {
  success: boolean;
  data?: {
    jd_info: JDInfo;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface ResumeParseRequest {
  resume_text: string;
  candidate_name?: string;
}

export interface ResumeParseResponse {
  success: boolean;
  data?: {
    resume_info: ResumeInfo;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface MatchRequest {
  jd_info: Partial<JDInfo>;
  resume_info: Partial<ResumeInfo>;
}

export interface MatchResponse {
  success: boolean;
  data?: MatchScore;
  error?: {
    code: string;
    message: string;
  };
}

export interface HistoryReport {
  id: string;
  position_name: string;
  created_at: string;
}

export interface HistoryListResponse {
  success: boolean;
  data?: {
    reports: HistoryReport[];
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface HealthResponse {
  success: boolean;
  data?: {
    status: string;
    version: string;
    uptime: number;
  };
}

export interface InfoResponse {
  success: boolean;
  data?: {
    name: string;
    version: string;
  };
}

// 竞品相关类型
export interface Competitor {
  name: string;
  url: string;
  status: "active" | "inactive";
  last_updated: string;
}

export interface CompetitorSnapshot {
  competitor_name: string;
  timestamp: string;
  price?: number;
  mau?: number;
  ranking?: number;
  features?: string[];
}

export type ScreeningStep =
  | "init"
  | "parsing_jd"
  | "parsing_resumes"
  | "matching"
  | "generating_report"
  | "completed";

export const SCREENING_STEPS: { key: ScreeningStep; label: string; icon: string }[] = [
  { key: "init", label: "等待开始", icon: "⏳" },
  { key: "parsing_jd", label: "解析JD", icon: "📋" },
  { key: "parsing_resumes", label: "解析简历", icon: "📄" },
  { key: "matching", label: "匹配评分", icon: "🔍" },
  { key: "generating_report", label: "生成报告", icon: "📊" },
  { key: "completed", label: "完成", icon: "✅" },
];