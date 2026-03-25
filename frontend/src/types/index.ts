/**
 * 类型定义索引 - 统一导出所有类型
 */

// API类型
export type {
  ScreeningRequest,
  JDParseRequest,
  ResumeParseRequest,
  MatchRequest,
  JDInfo,
  ResumeInfo,
  Candidate,
  Report,
  APIResponse,
  HealthResponse,
  HistoryReport,
} from "@/lib/api";

// React组件Props类型
export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// 筛选步骤
export type ScreeningStep =
  | "init"
  | "parsing_jd"
  | "parsing_resumes"
  | "matching"
  | "generating_report"
  | "completed";

// 评分等级
export type ScoreLevel = "STRONG_RECOMMEND" | "BACKUP" | "REJECTED";

// 候选人信息
export interface CandidateInfo {
  candidate_name: string;
  match_score: number;
  level: ScoreLevel;
  summary: string;
  current_company?: string;
  years_experience?: number;
  education?: string;
  skills?: string[];
  industry_experience?: string[];
}

// 筛选报告
export interface ScreeningReport {
  position_name: string;
  jd_source: string;
  total_resumes: number;
  screened_resumes: number;
  strong_recommendations: CandidateInfo[];
  backup_candidates: CandidateInfo[];
  screening_criteria: string[];
  generated_at: string;
}

// Toast类型
export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

// 表单验证
export interface ValidationError {
  field: string;
  message: string;
}

// API错误
export interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
}