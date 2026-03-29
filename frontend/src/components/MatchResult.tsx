"use client";

import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
interface ScoreBreakdown {
  hard_conditions?: number;    // 硬性条件
  skill_match?: number;        // 技能匹配
  industry_exp?: number;        // 行业经验
  potential?: number;          // 发展潜力
}

interface Candidate {
  candidate_name: string;
  match_score: number;
  level: string;
  summary: string;
  current_company?: string;
  years_experience?: number;
  matched_criteria?: string[];
  resume_text?: string;
  score_breakdown?: ScoreBreakdown;
  tags?: string[];
  ai_reason?: string;  // AI推荐理由
  key_highlights?: string[];  // 关键经历亮点
  similar_candidates?: Candidate[];  // 相似候选人
  source?: "referral" | "headhunter" | "website" | "resume_db" | "other";  // 简历来源
  source_name?: string;  // 来源名称（如猎头名称或网站名称）
  score_history?: { date: string; score: number }[];  // 评分历史
  starred?: boolean;  // 收藏标记
  interviews?: { round: number; date: string; feedback: string; rating: number }[];  // 面试反馈
  percentile?: number;  // 百分位排名
  status?: "pending" | "interview" | "offer" | "hired" | "rejected";  // 候选人状态
}

/* ============================================
   MATCHRESULT COMPONENT
   ============================================

   Design System Applied:
   - Card: Dark elevated surface
   - Colors: Cyan (#0891B2), Amber (#f59e0b), Emerald (#10b981), Purple (#7c3aed)
   - Motion: Scale on hover, staggered animations
   ============================================ */

// 计算候选人在全体中的百分位排名
function calculatePercentile(candidates: Candidate[], candidateName: string): number {
  const sorted = [...candidates].sort((a, b) => b.match_score - a.match_score);
  const index = sorted.findIndex(c => c.candidate_name === candidateName);
  if (index === -1) return 0;
  return Math.round(((sorted.length - index - 1) / sorted.length) * 100);
}

// 获取百分位等级标签
function getPercentileLabel(percentile: number): { label: string; color: string; bg: string } {
  if (percentile >= 90) return { label: "顶尖", color: "text-[#34d399]", bg: "bg-[#10b981]" };
  if (percentile >= 70) return { label: "优秀", color: "text-[#22d3ee]", bg: "bg-[#0891b2]" };
  if (percentile >= 50) return { label: "良好", color: "text-[#60a5fa]", bg: "bg-[#3b82f6]" };
  if (percentile >= 30) return { label: "一般", color: "text-[#fbbf24]", bg: "bg-[#f59e0b]" };
  return { label: "靠后", color: "text-[#94a3b8]", bg: "bg-[#64748b]" };
}

interface MatchResultProps {
  strongRecommendations: Candidate[];
  backupCandidates: Candidate[];
  criteria: string[];
}

type CandidateStatus = "pending" | "interview" | "offer" | "hired" | "rejected";

// AI推荐理由生成
function generateAIRecommendation(candidate: Candidate): string {
  const reasons: string[] = [];
  const sb = candidate.score_breakdown;

  if (sb?.hard_conditions && sb.hard_conditions >= 80) {
    reasons.push("硬性条件完全达标：学历、工作年限等基础要求符合JD标准");
  } else if (sb?.hard_conditions && sb.hard_conditions >= 60) {
    reasons.push("硬性条件基本满足，可进一步沟通确认");
  }

  if (sb?.skill_match && sb.skill_match >= 80) {
    reasons.push("技能匹配度极高，具备岗位所需核心技能");
  } else if (sb?.skill_match && sb.skill_match >= 60) {
    reasons.push("技能与岗位要求有一定匹配，上手成本较低");
  }

  if (sb?.industry_exp && sb.industry_exp >= 80) {
    reasons.push("行业经验深厚，熟悉行业痛点和解决方案");
  } else if (sb?.industry_exp && sb.industry_exp >= 60) {
    reasons.push("有相关行业背景，能快速融入团队");
  }

  if (sb?.potential && sb.potential >= 80) {
    reasons.push("发展潜力优秀，具备成长为专家的潜质");
  } else if (sb?.potential && sb.potential >= 60) {
    reasons.push("有一定的成长空间，值得培养");
  }

  if (candidate.tags?.includes("大厂经验")) {
    reasons.push("具有知名企业工作背景，视野和专业度高");
  }
  if (candidate.tags?.includes("管理经验")) {
    reasons.push("具备团队管理经验，可承担更大责任");
  }
  if (candidate.tags?.includes("海归")) {
    reasons.push("具有国际化背景，语言和跨文化沟通能力强");
  }

  if (reasons.length === 0) {
    return "综合评估后推荐，建议面试进一步了解";
  }

  return reasons.join("；") + "。";
}

// 评分历史生成（模拟数据）
function generateMockScoreHistory(candidate: Candidate): { date: string; score: number }[] {
  const base = candidate.match_score;
  const now = new Date();
  return [
    { date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(), score: Math.max(50, base - 15) },
    { date: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(), score: Math.max(55, base - 10) },
    { date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(), score: Math.max(60, base - 5) },
    { date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), score: Math.max(65, base - 2) },
    { date: now.toISOString(), score: base },
  ];
}

// 关键经历亮点提取
function generateKeyHighlights(candidate: Candidate): string[] {
  const highlights: string[] = [];

  if (candidate.years_experience && candidate.years_experience >= 5) {
    highlights.push(`${candidate.years_experience}年相关工作经验，资历深厚`);
  } else if (candidate.years_experience) {
    highlights.push(`${candidate.years_experience}年工作经验，有一定积累`);
  }

  if (candidate.current_company) {
    highlights.push(`当前任职于 ${candidate.current_company}`);
  }

  if (candidate.tags) {
    const notableTags = candidate.tags.filter(t =>
      ["大厂经验", "管理经验", "海归", "SaaS", "创业经验"].includes(t)
    );
    if (notableTags.length > 0) {
      highlights.push(`标签优势：${notableTags.join("、")}`);
    }
  }

  if (candidate.matched_criteria && candidate.matched_criteria.length > 0) {
    highlights.push(`匹配标准：${candidate.matched_criteria.slice(0, 2).join("、")}`);
  }

  return highlights.slice(0, 4);
}

function CandidateDetailModal({
  candidate,
  criteria,
  allCandidates,
  customTags,
  notes,
  onClose,
  onStatusChange,
  onAddTag,
  onSaveNote,
  onSelectSimilar,
}: {
  candidate: Candidate;
  criteria: string[];
  allCandidates: Candidate[];
  customTags: Map<string, string[]>;
  notes: Map<string, string>;
  onClose: () => void;
  onStatusChange: (status: CandidateStatus) => void;
  onAddTag?: (candidateName: string, tag: string) => void;
  onSaveNote?: (candidateName: string, note: string) => void;
  onSelectSimilar?: (candidate: Candidate) => void;
}) {
  const [status, setStatus] = useState<CandidateStatus>("pending");
  const [note, setNote] = useState(notes.get(candidate.candidate_name) || "");

  // 计算百分位排名
  const percentile = calculatePercentile(allCandidates, candidate.candidate_name);
  const percentileInfo = getPercentileLabel(percentile);

  // Auto-suggest tags based on candidate profile
  const suggestTags = (c: Candidate): string[] => {
    const suggestions: string[] = [];
    const existingTags = [...(c.tags || []), ...(customTags.get(c.candidate_name) || [])];

    if (c.current_company) {
      const company = c.current_company.toLowerCase();
      if (["阿里巴巴", "腾讯", "字节跳动", "百度", "京东", "美团", "华为"].some(b => company.includes(b))) {
        suggestions.push("大厂经验");
      }
      if (["创业", " startup", "startup"].some(b => company.includes(b))) {
        suggestions.push("创业经验");
      }
    }

    if (c.years_experience) {
      if (c.years_experience >= 8) suggestions.push("资深专家");
      else if (c.years_experience >= 5) suggestions.push("经验丰富");
      else if (c.years_experience >= 3) suggestions.push("中高年级");
    }

    if (c.summary) {
      const summary = c.summary.toLowerCase();
      if (summary.includes("硕士") || summary.includes("研究生")) suggestions.push("硕士学历");
      if (summary.includes("博士")) suggestions.push("博士学历");
      if (summary.includes("海归") || summary.includes("海外")) suggestions.push("海归");
      if (summary.includes("985") || summary.includes("211")) suggestions.push("985/211");
    }

    if (c.matched_criteria) {
      c.matched_criteria.forEach(criteria => {
        const cr = criteria.toLowerCase();
        if (cr.includes("管理")) suggestions.push("管理经验");
        if (cr.includes("SaaS")) suggestions.push("SaaS");
        if (cr.includes("电商")) suggestions.push("电商");
        if (cr.includes("金融")) suggestions.push("金融");
        if (cr.includes("AI") || cr.includes("人工智能")) suggestions.push("AI");
      });
    }

    if (c.match_score >= 85) suggestions.push("高分候选人");
    if (c.level === "strong_recommend") suggestions.push("强烈推荐");

    return [...new Set(suggestions)].filter(s => !existingTags.includes(s));
  };

  // Highlight keywords from JD criteria in text
  const highlightKeywords = (text: string, jdCriteria: string[]): React.ReactNode => {
    if (!jdCriteria || jdCriteria.length === 0) return text;

    // Extract keywords from criteria
    const keywords: string[] = [];
    jdCriteria.forEach(c => {
      const cleaned = c.replace(/[≥≤><\d年\d月以上以下]/g, "").trim();
      const parts = cleaned.split(/[,，/、\\]+|[和与及或]+/);
      parts.forEach(p => {
        const trimmed = p.trim();
        if (trimmed.length >= 2) {
          keywords.push(trimmed);
        }
      });
    });

    if (keywords.length === 0) return text;

    const pattern = new RegExp(`(${keywords.join("|")})`, "gi");
    const parts = text.split(pattern);
    return parts.map((part, i) => {
      const isMatch = keywords.some(k => k.toLowerCase() === part.toLowerCase());
      if (isMatch) {
        return (
          <span key={i} className="bg-[#0891b2]/30 text-[#22d3ee] px-1 rounded">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-[#34d399]";
    if (score >= 60) return "text-[#fbbf24]";
    return "text-[#f87171]";
  };

  const statusOptions: { value: CandidateStatus; label: string; color: string }[] = [
    { value: "pending", label: "待沟通", color: "bg-[#64748b]" },
    { value: "interview", label: "面试中", color: "bg-[#f59e0b]" },
    { value: "offer", label: "Offer", color: "bg-[#10b981]" },
    { value: "hired", label: "已入职", color: "bg-[#7c3aed]" },
    { value: "rejected", label: "淘汰", color: "bg-[#ef4444]" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#1f2937] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-[#334155]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0891b2] to-[#0e7490] px-6 py-4">
          <div className="flex justify-between items-start">
            <div>
              <motion.h2
                whileHover={{ scale: 1.02 }}
                className="text-xl font-bold text-white cursor-default"
              >
                {candidate.candidate_name}
              </motion.h2>
              <motion.p
                whileHover={{ scale: 1.02 }}
                className="text-[#a5f3fc] text-sm mt-1 cursor-default"
              >
                {candidate.years_experience && `${candidate.years_experience}年经验`}
                {candidate.current_company && ` · ${candidate.current_company}`}
              </motion.p>
            </div>
            <div className="text-right">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`text-4xl font-bold ${getScoreColor(candidate.match_score)}`}
              >
                {candidate.match_score}%
              </motion.div>
              <div className="flex items-center gap-2 mt-1 justify-end">
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className={`text-xs font-medium ${percentileInfo.color} cursor-default`}
                >
                  超越 {percentile}% 的候选人
                </motion.span>
                <span className={`text-xs px-2 py-0.5 rounded-full text-white ${percentileInfo.bg}`}>
                  {percentileInfo.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Match Score Breakdown */}
          <div className="mb-6">
            <motion.h3
              whileHover={{ scale: 1.02 }}
              className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wider mb-3 cursor-default"
            >
              匹配度分析
            </motion.h3>
            <div className="bg-[#0a0f1a] rounded-xl p-4 border border-[#334155]">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 bg-[#334155] rounded-full h-4 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${candidate.match_score}%` }}
                    transition={{ duration: 0.8 }}
                    whileHover={{ boxShadow: "0 0 12px rgba(34, 211, 238, 0.5)", scaleY: 1.2 }}
                    className={`h-full rounded-full ${
                      candidate.match_score >= 80
                        ? "bg-[#10b981]"
                        : candidate.match_score >= 60
                        ? "bg-[#f59e0b]"
                        : "bg-[#ef4444]"
                    }`}
                  />
                </div>
                <span className={`text-2xl font-bold ${getScoreColor(candidate.match_score)}`}>
                  {candidate.match_score}%
                </span>
              </div>

              {/* Score Breakdown */}
              {candidate.score_breakdown && (
                <div className="mt-4 space-y-3">
                  <motion.h4
                    whileHover={{ scale: 1.02 }}
                    className="text-xs font-semibold text-[#64748b] uppercase tracking-wider cursor-default"
                  >
                    评分明细
                  </motion.h4>
                  {candidate.score_breakdown.hard_conditions !== undefined && (
                    <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-3 cursor-default">
                      <span className="w-20 text-xs text-[#94a3b8]">硬性条件</span>
                      <div className="flex-1 bg-[#334155]/50 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${candidate.score_breakdown.hard_conditions}%` }}
                          transition={{ duration: 0.8, delay: 0.1 }}
                          whileHover={{ boxShadow: "0 0 8px rgba(34, 211, 238, 0.6)" }}
                          className="h-full bg-[#0891b2] rounded-full"
                        />
                      </div>
                      <span className="w-10 text-xs text-[#22d3ee] font-medium">
                        {candidate.score_breakdown.hard_conditions}%
                      </span>
                    </motion.div>
                  )}
                  {candidate.score_breakdown.skill_match !== undefined && (
                    <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-3 cursor-default">
                      <span className="w-20 text-xs text-[#94a3b8]">技能匹配</span>
                      <div className="flex-1 bg-[#334155]/50 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${candidate.score_breakdown.skill_match}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          whileHover={{ boxShadow: "0 0 8px rgba(52, 211, 153, 0.6)" }}
                          className="h-full bg-[#10b981] rounded-full"
                        />
                      </div>
                      <span className="w-10 text-xs text-[#34d399] font-medium">
                        {candidate.score_breakdown.skill_match}%
                      </span>
                    </motion.div>
                  )}
                  {candidate.score_breakdown.industry_exp !== undefined && (
                    <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-3 cursor-default">
                      <span className="w-20 text-xs text-[#94a3b8]">行业经验</span>
                      <div className="flex-1 bg-[#334155]/50 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${candidate.score_breakdown.industry_exp}%` }}
                          transition={{ duration: 0.8, delay: 0.3 }}
                          whileHover={{ boxShadow: "0 0 8px rgba(251, 191, 36, 0.6)" }}
                          className="h-full bg-[#f59e0b] rounded-full"
                        />
                      </div>
                      <span className="w-10 text-xs text-[#fbbf24] font-medium">
                        {candidate.score_breakdown.industry_exp}%
                      </span>
                    </motion.div>
                  )}
                  {candidate.score_breakdown.potential !== undefined && (
                    <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-3 cursor-default">
                      <span className="w-20 text-xs text-[#94a3b8]">发展潜力</span>
                      <div className="flex-1 bg-[#334155]/50 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${candidate.score_breakdown.potential}%` }}
                          transition={{ duration: 0.8, delay: 0.4 }}
                          whileHover={{ boxShadow: "0 0 8px rgba(167, 139, 250, 0.6)" }}
                          className="h-full bg-[#7c3aed] rounded-full"
                        />
                      </div>
                      <span className="w-10 text-xs text-[#a78bfa] font-medium">
                        {candidate.score_breakdown.potential}%
                      </span>
                    </motion.div>
                  )}
                </div>
              )}

              <p className="text-[#cbd5e1] text-sm mt-4">{highlightKeywords(candidate.summary, criteria)}</p>
            </div>
          </div>

          {/* Matched Criteria */}
          {candidate.matched_criteria && candidate.matched_criteria.length > 0 && (
            <div className="mb-6">
              <motion.h3
                whileHover={{ scale: 1.02 }}
                className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wider mb-3 cursor-default"
              >
                匹配的标准
              </motion.h3>
              <div className="flex flex-wrap gap-2">
                {candidate.matched_criteria.map((c, i) => (
                  <motion.span
                    key={i}
                    whileHover={{ scale: 1.05, boxShadow: "0 0 12px rgba(52, 211, 153, 0.4)" }}
                    className="bg-[#10b981]/20 text-[#34d399] px-3 py-1.5 rounded-full text-sm border border-[#10b981]/30 flex items-center gap-1 cursor-default"
                  >
                    <span className="w-1.5 h-1.5 bg-[#34d399] rounded-full" />
                    {c}
                  </motion.span>
                ))}
              </div>
            </div>
          )}

          {/* Screening Criteria Reference */}
          <div className="mb-6">
            <motion.h3
              whileHover={{ scale: 1.02 }}
              className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wider mb-3 cursor-default"
            >
              筛选标准 (JD要求)
            </motion.h3>
            <div className="flex flex-wrap gap-2">
              {criteria.map((c, i) => (
                <motion.span
                  key={i}
                  whileHover={{ scale: 1.05, borderColor: "rgba(34, 211, 238, 0.5)" }}
                  className="bg-[#0a0f1a] text-[#cbd5e1] px-3 py-1.5 rounded-full text-sm border border-[#334155] flex items-center gap-1 cursor-default"
                >
                  <span className="w-1.5 h-1.5 bg-[#0891b2] rounded-full" />
                  {c}
                </motion.span>
              ))}
            </div>
          </div>

          {/* 推荐标签 */}
          {(() => {
            const suggestions = suggestTags(candidate);
            return suggestions.length > 0 ? (
              <div className="mb-6">
                <motion.h3
                  whileHover={{ scale: 1.02 }}
                  className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wider mb-3 cursor-default"
                >
                  推荐标签
                </motion.h3>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((tag) => (
                    <motion.button
                      key={tag}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onAddTag?.(candidate.candidate_name, tag)}
                      className="bg-[#7c3aed]/20 text-[#a78bfa] px-3 py-1.5 rounded-full text-sm border border-[#7c3aed]/30 hover:bg-[#7c3aed]/30 transition-colors flex items-center gap-1"
                    >
                      <span className="text-xs">+</span>
                      {tag}
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : null;
          })()}

          {/* AI推荐理由 */}
          <div className="mb-6">
            <motion.h3
              whileHover={{ scale: 1.02 }}
              className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wider mb-3 cursor-default"
            >
              AI推荐理由
            </motion.h3>
            <div className="bg-gradient-to-r from-[#7c3aed]/30 to-[#7c3aed]/10 rounded-xl p-4 border border-[#7c3aed]/30">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🤖</span>
                <div className="flex-1">
                  <p className="text-[#e2e8f0] text-sm leading-relaxed">
                    {candidate.ai_reason || generateAIRecommendation(candidate)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 关键经历亮点 */}
          {(candidate.key_highlights || generateKeyHighlights(candidate)).length > 0 && (
            <div className="mb-6">
              <motion.h3
                whileHover={{ scale: 1.02 }}
                className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wider mb-3 cursor-default"
              >
                关键经历亮点
              </motion.h3>
              <div className="space-y-2">
                {(candidate.key_highlights || generateKeyHighlights(candidate)).map((highlight, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.01, borderColor: "rgba(52, 211, 153, 0.4)" }}
                    className="flex items-start gap-2 bg-[#0a0f1a] rounded-lg p-3 border border-[#334155] cursor-default"
                  >
                    <span className="w-5 h-5 bg-[#10b981]/20 text-[#34d399] rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-[#cbd5e1] text-sm">{highlight}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Resume Text Preview */}
          {candidate.resume_text && (
            <div className="mb-6">
              <motion.h3
                whileHover={{ scale: 1.02 }}
                className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wider mb-3 cursor-default"
              >
                简历摘要
              </motion.h3>
              <div className="bg-[#0a0f1a] rounded-xl p-4 border border-[#334155]">
                <p className="text-[#cbd5e1] text-sm whitespace-pre-wrap">
                  {candidate.resume_text.slice(0, 500)}
                  {candidate.resume_text.length > 500 && "..."}
                </p>
              </div>
            </div>
          )}

          {/* 评分历史 */}
          {(candidate.score_history || generateMockScoreHistory(candidate)).length > 0 && (
            <div className="mb-6">
              <motion.h3
                whileHover={{ scale: 1.02 }}
                className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wider mb-3 cursor-default"
              >
                评分历史
              </motion.h3>
              <div className="bg-[#0a0f1a] rounded-xl p-4 border border-[#334155]">
                <div className="flex items-end gap-1 h-20">
                  {(candidate.score_history || generateMockScoreHistory(candidate)).map((entry, i, arr) => {
                    const height = `${entry.score}%`;
                    const isLatest = i === arr.length - 1;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: height }}
                          transition={{ duration: 0.5, delay: i * 0.1 }}
                          whileHover={{ scaleY: 1.1, boxShadow: "0 0 10px rgba(34, 211, 238, 0.5)" }}
                          className={`w-full rounded-t-sm ${isLatest ? "bg-[#0891b2]" : "bg-[#475569]"}`}
                        />
                        <motion.span whileHover={{ scale: 1.1 }} className="text-xs text-[#64748b] cursor-default">
                          {new Date(entry.date).toLocaleDateString().slice(5)}
                        </motion.span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-2 text-xs text-[#64748b]">
                  <motion.span whileHover={{ scale: 1.05 }} className="cursor-default">早期评估</motion.span>
                  <motion.span whileHover={{ scale: 1.05 }} className="cursor-default">最近评估: <span className="text-[#22d3ee]">{candidate.match_score}%</span></motion.span>
                </div>
              </div>
            </div>
          )}

          {/* Status Management */}
          <div className="mb-6">
            <motion.h3
              whileHover={{ scale: 1.02 }}
              className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wider mb-3 cursor-default"
            >
              候选人状态
            </motion.h3>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((opt) => (
                <motion.button
                  key={opt.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setStatus(opt.value);
                    onStatusChange(opt.value);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    status === opt.value
                      ? `${opt.color} text-white shadow-lg`
                      : "bg-[#0a0f1a] text-[#94a3b8] border border-[#334155] hover:border-[#475569]"
                  }`}
                >
                  {opt.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* 相似候选人 */}
          {(candidate.similar_candidates || []).length > 0 && (
            <div className="mb-6">
              <motion.h3
                whileHover={{ scale: 1.02 }}
                className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wider mb-3 cursor-default"
              >
                相似候选人
              </motion.h3>
              <div className="space-y-2">
                {candidate.similar_candidates?.slice(0, 3).map((similar, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.02, borderColor: "rgba(34, 211, 238, 0.5)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onSelectSimilar?.(similar);
                    }}
                    className="w-full flex items-center justify-between bg-[#0a0f1a] rounded-lg p-3 border border-[#334155] hover:border-[#0891b2]/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-[#475569]/50 text-[#94a3b8] rounded-full flex items-center justify-center text-xs">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm text-[#f8fafc] font-medium">{similar.candidate_name}</p>
                        <p className="text-xs text-[#64748b]">{similar.current_company}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${getScoreColor(similar.match_score)}`}>
                      {similar.match_score}%
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Interview Feedback */}
          {(candidate.interviews || []).length > 0 && (
            <div className="mb-6">
              <motion.h3
                whileHover={{ scale: 1.02 }}
                className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wider mb-3 cursor-default"
              >
                面试反馈 ({candidate.interviews?.length}轮)
              </motion.h3>
              <div className="space-y-3">
                {candidate.interviews?.map((interview, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.01 }}
                    className="bg-[#0a0f1a] rounded-lg p-3 border border-[#334155] hover:border-[#475569] transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#22d3ee]">第{interview.round}轮面试</span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, si) => (
                          <motion.span
                            key={si}
                            whileHover={{ scale: 1.3 }}
                            className={`text-sm ${si < interview.rating ? "text-[#fbbf24]" : "text-[#475569]"}`}
                          >★</motion.span>
                        ))}
                      </div>
                    </div>
                    <motion.p whileHover={{ scale: 1.02 }} className="text-xs text-[#64748b] mb-1 cursor-default">{interview.date}</motion.p>
                    <p className="text-sm text-[#cbd5e1]">{interview.feedback}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <motion.h3
                whileHover={{ scale: 1.02 }}
                className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wider cursor-default"
              >
                备注
              </motion.h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSaveNote?.(candidate.candidate_name, note)}
                className="px-3 py-1 bg-[#0891b2]/20 text-[#22d3ee] border border-[#0891b2]/30 rounded-lg hover:bg-[#0891b2]/30 transition-colors text-xs flex items-center gap-1"
              >
                保存备注
              </motion.button>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="添加备注信息..."
              className="w-full bg-[#0a0f1a] border border-[#334155] rounded-xl px-4 py-3 text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:border-[#0891b2] resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Footer - Quick Actions */}
        <div className="bg-[#0a0f1a] px-6 py-4 border-t border-[#334155]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[#94a3b8]">快捷操作</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setStatus("interview");
                onStatusChange("interview");
              }}
              className="px-4 py-2 bg-[#10b981]/20 text-[#34d399] border border-[#10b981]/30 rounded-lg hover:bg-[#10b981]/30 transition-colors text-sm flex items-center gap-2"
            >
              安排面试
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const subject = encodeURIComponent(`【Spider招聘】关于${candidate.candidate_name}的面试邀请`);
                window.open(`mailto:?subject=${subject}`);
              }}
              className="px-4 py-2 bg-[#3b82f6]/20 text-[#60a5fa] border border-[#3b82f6]/30 rounded-lg hover:bg-[#3b82f6]/30 transition-colors text-sm flex items-center gap-2"
            >
              发送邮件
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setStatus("offer");
                onStatusChange("offer");
              }}
              className="px-4 py-2 bg-[#7c3aed]/20 text-[#a78bfa] border border-[#7c3aed]/30 rounded-lg hover:bg-[#7c3aed]/30 transition-colors text-sm flex items-center gap-2"
            >
              发放Offer
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const data = JSON.stringify({ ...candidate, note, status }, null, 2);
                const blob = new Blob([data], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `candidate-${candidate.candidate_name}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-4 py-2 bg-[#0891b2]/20 text-[#22d3ee] border border-[#0891b2]/30 rounded-lg hover:bg-[#0891b2]/30 transition-colors text-sm flex items-center gap-2"
            >
              导出
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function MatchResult({
  strongRecommendations,
  backupCandidates,
  criteria,
}: MatchResultProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [batchSelected, setBatchSelected] = useState<string[]>([]);
  const [batchMode, setBatchMode] = useState(false);
  const [starred, setStarred] = useState<Set<string>>(new Set());
  const [showOnlyStarred, setShowOnlyStarred] = useState(false);
  const [showOnlyWithNotes, setShowOnlyWithNotes] = useState(false);
  const [minScore, setMinScore] = useState<number>(0);
  const [notes, setNotes] = useState<Map<string, string>>(new Map());
  const [sortBy, setSortBy] = useState<"score" | "name" | "experience">("score");
  const [customTags, setCustomTags] = useState<Map<string, string[]>>(new Map());
  const [activityLog, setActivityLog] = useState<{ time: string; action: string; candidate: string }[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Candidate[]>([]);
  const [showQuickActions, setShowQuickActions] = useState<string | null>(null);

  // Add custom tag to candidate
  const addTagToCandidate = useCallback((candidateName: string, tag: string) => {
    setCustomTags(prev => {
      const next = new Map(prev);
      const existing = next.get(candidateName) || [];
      if (!existing.includes(tag)) {
        next.set(candidateName, [...existing, tag]);
      }
      return next;
    });
  }, []);

  // Get all tags for a candidate (built-in + custom)
  const getAllTags = useCallback((candidate: Candidate) => {
    return [...(candidate.tags || []), ...(customTags.get(candidate.candidate_name) || [])];
  }, [customTags]);

  // Combine all candidates
  const allCandidates = useMemo(
    () => [...strongRecommendations, ...backupCandidates],
    [strongRecommendations, backupCandidates]
  );

  // Extract all unique tags (including custom tags)
  const allTags = useMemo(() => Array.from(
    new Set([
      ...allCandidates.flatMap((c) => c.tags || []),
      ...Array.from(customTags.values()).flat()
    ])
  ), [allCandidates, customTags]);

  // Filter candidates
  const filteredStrong = useMemo(() => strongRecommendations.filter((c) => {
    const matchesSearch =
      !searchQuery ||
      c.candidate_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.current_company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tag) => getAllTags(c).includes(tag));
    const matchesStarred = !showOnlyStarred || starred.has(c.candidate_name);
    const matchesNotes = !showOnlyWithNotes || notes.has(c.candidate_name);
    const matchesScore = c.match_score >= minScore;
    return matchesSearch && matchesTags && matchesStarred && matchesNotes && matchesScore;
  }), [strongRecommendations, searchQuery, selectedTags, showOnlyStarred, showOnlyWithNotes, minScore, getAllTags, starred, notes]);

  const filteredBackup = useMemo(() => backupCandidates.filter((c) => {
    const matchesSearch =
      !searchQuery ||
      c.candidate_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.current_company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tag) => getAllTags(c).includes(tag));
    const matchesStarred = !showOnlyStarred || starred.has(c.candidate_name);
    const matchesNotes = !showOnlyWithNotes || notes.has(c.candidate_name);
    const matchesScore = c.match_score >= minScore;
    return matchesSearch && matchesTags && matchesStarred && matchesNotes && matchesScore;
  }), [backupCandidates, searchQuery, selectedTags, showOnlyStarred, showOnlyWithNotes, minScore, getAllTags, starred, notes]);

  // Sort candidates
  const sortedFilteredStrong = useMemo(() => {
    return [...filteredStrong].sort((a, b) => {
      if (sortBy === "score") return b.match_score - a.match_score;
      if (sortBy === "name") return a.candidate_name.localeCompare(b.candidate_name, "zh-CN");
      if (sortBy === "experience") return (b.years_experience || 0) - (a.years_experience || 0);
      return 0;
    });
  }, [filteredStrong, sortBy]);

  const sortedFilteredBackup = useMemo(() => {
    return [...filteredBackup].sort((a, b) => {
      if (sortBy === "score") return b.match_score - a.match_score;
      if (sortBy === "name") return a.candidate_name.localeCompare(b.candidate_name, "zh-CN");
      if (sortBy === "experience") return (b.years_experience || 0) - (a.years_experience || 0);
      return 0;
    });
  }, [filteredBackup, sortBy]);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const getLevelBadge = useCallback((level: string) => {
    switch (level) {
      case "strong_recommend":
        return (
          <motion.span whileHover={{ scale: 1.1 }} className="bg-gradient-to-r from-[#10b981] to-[#059669] text-white text-xs px-3 py-1 rounded-full shadow-lg shadow-[#10b981]/30">
            强烈推荐
          </motion.span>
        );
      case "backup":
        return (
          <motion.span whileHover={{ scale: 1.1 }} className="bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] text-[#78350f] text-xs px-3 py-1 rounded-full shadow-lg shadow-[#f59e0b]/30">
            可备选
          </motion.span>
        );
      default:
        return (
          <span className="bg-[#64748b] text-[#e2e8f0] text-xs px-3 py-1 rounded-full">
            {level}
          </span>
        );
    }
  }, []);

  const getScoreColor = useCallback((score: number) => {
    if (score >= 80) return "text-[#34d399]";
    if (score >= 60) return "text-[#fbbf24]";
    return "text-[#f87171]";
  }, []);

  const getScoreBg = useCallback((score: number) => {
    if (score >= 80) return "from-[#10b981]/20 to-[#059669]/10";
    if (score >= 60) return "from-[#f59e0b]/20 to-[#d97706]/10";
    return "from-[#ef4444]/20 to-[#dc2626]/10";
  }, []);

  const handleStatusChange = useCallback((candidate: Candidate, status: CandidateStatus) => {
    const statusLabels = { pending: "待沟通", interview: "面试中", offer: "Offer", hired: "已入职", rejected: "淘汰" };
    setActivityLog(prev => [{
      time: new Date().toLocaleTimeString(),
      action: `状态更新为"${statusLabels[status]}"`,
      candidate: candidate.candidate_name
    }, ...prev].slice(0, 50));
  }, []);

  const logActivity = useCallback((action: string, candidate: string) => {
    setActivityLog(prev => [{
      time: new Date().toLocaleTimeString(),
      action,
      candidate
    }, ...prev].slice(0, 50));
  }, []);

  // Track recently viewed candidates
  const addToRecentlyViewed = useCallback((candidate: Candidate) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(c => c.candidate_name !== candidate.candidate_name);
      return [candidate, ...filtered].slice(0, 5);
    });
  }, []);

  // Generate share link for a candidate
  const generateShareLink = useCallback((candidate: Candidate) => {
    const shareData = {
      name: candidate.candidate_name,
      score: candidate.match_score,
      company: candidate.current_company,
      level: candidate.level === "strong_recommend" ? "强烈推荐" : "可备选",
      summary: candidate.summary,
    };
    const encoded = encodeURIComponent(btoa(JSON.stringify(shareData)));
    return `${window.location.origin}${window.location.pathname}?candidate=${encoded}`;
  }, []);

  // Copy candidate info to clipboard
  const copyCandidateInfo = useCallback((candidate: Candidate) => {
    const info = `${candidate.candidate_name}
匹配度: ${candidate.match_score}%
${candidate.current_company ? `公司: ${candidate.current_company}` : ""}
${candidate.years_experience ? `工作年限: ${candidate.years_experience}年` : ""}
推荐等级: ${candidate.level === "strong_recommend" ? "强烈推荐" : "可备选"}
${candidate.summary}
${candidate.matched_criteria?.length ? `匹配标准: ${candidate.matched_criteria.join(", ")}` : ""}`;
    navigator.clipboard.writeText(info);
    logActivity("复制信息", candidate.candidate_name);
  }, [logActivity]);

  // Compute candidate statistics
  const candidateStats = useMemo(() => {
    const all = allCandidates;
    const avgScore = all.length > 0 ? Math.round(all.reduce((sum, c) => sum + c.match_score, 0) / all.length) : 0;
    const scoreDistribution = {
      high: all.filter(c => c.match_score >= 80).length,
      medium: all.filter(c => c.match_score >= 60 && c.match_score < 80).length,
      low: all.filter(c => c.match_score < 60).length,
    };
    const companies = [...new Set(all.map(c => c.current_company).filter(Boolean))];
    const topTags = all.flatMap(c => c.tags || []).reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topTagsArray = Object.entries(topTags).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return { avgScore, scoreDistribution, companies: companies.length, topTags: topTagsArray };
  }, [allCandidates]);

  return (
    <div className="space-y-6">
      {/* Candidate Detail Modal */}
      <AnimatePresence>
        {selectedCandidate && (
          <CandidateDetailModal
            candidate={selectedCandidate}
            criteria={criteria}
            allCandidates={allCandidates}
            customTags={customTags}
            notes={notes}
            onClose={() => setSelectedCandidate(null)}
            onStatusChange={(status) => handleStatusChange(selectedCandidate, status)}
            onAddTag={addTagToCandidate}
            onSaveNote={(name, noteText) => {
              setNotes(prev => {
                const next = new Map(prev);
                if (noteText.trim()) {
                  next.set(name, noteText);
                } else {
                  next.delete(name);
                }
                return next;
              });
              logActivity("保存备注", name);
            }}
            onSelectSimilar={(similar) => {
              setSelectedCandidate(similar);
            }}
          />
        )}
      </AnimatePresence>

      {/* Search & Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1f2937] rounded-xl p-4 border border-[#334155]"
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索候选人姓名、公司、摘要..."
              className="w-full bg-[#0a0f1a] border border-[#334155] rounded-lg px-4 py-2 pl-10 text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:border-[#0891b2]"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#22d3ee]">
                {sortedFilteredStrong.length + sortedFilteredBackup.length} 条结果
              </span>
            )}
          </div>

          {/* Batch Mode Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setBatchMode(!batchMode);
              setBatchSelected([]);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              batchMode
                ? "bg-[#7c3aed] text-white"
                : "bg-[#0a0f1a] text-[#94a3b8] border border-[#334155] hover:border-[#7c3aed]"
            }`}
          >
            {batchMode ? "✓ 退出批量" : "批量操作"}
          </motion.button>

          {/* Batch Select All / Deselect */}
          {batchMode && (
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setBatchSelected(sortedFilteredStrong.map(c => c.candidate_name))}
                className="px-3 py-1.5 bg-[#0a0f1a] text-[#94a3b8] border border-[#334155] hover:border-[#0891b2] rounded-lg text-xs transition-colors"
              >
                全选强推
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setBatchSelected(sortedFilteredBackup.map(c => c.candidate_name))}
                className="px-3 py-1.5 bg-[#0a0f1a] text-[#94a3b8] border border-[#334155] hover:border-[#0891b2] rounded-lg text-xs transition-colors"
              >
                全选备选
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setBatchSelected([])}
                className="px-3 py-1.5 bg-[#0a0f1a] text-[#94a3b8] border border-[#334155] hover:border-[#ef4444] rounded-lg text-xs transition-colors"
              >
                取消全选
              </motion.button>
            </div>
          )}

          {/* Starred filter */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowOnlyStarred(!showOnlyStarred);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              showOnlyStarred
                ? "bg-[#f59e0b] text-white"
                : "bg-[#0a0f1a] text-[#94a3b8] border border-[#334155] hover:border-[#f59e0b]"
            }`}
          >
            ★ 我的收藏 ({starred.size})
          </motion.button>

          {/* Notes filter */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowOnlyWithNotes(!showOnlyWithNotes);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              showOnlyWithNotes
                ? "bg-[#0891b2] text-white"
                : "bg-[#0a0f1a] text-[#94a3b8] border border-[#334155] hover:border-[#0891b2]"
            }`}
          >
            有笔记 ({notes.size})
          </motion.button>

          {/* Score Range Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#94a3b8]">评分:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-24 h-2 bg-[#334155] rounded-lg appearance-none cursor-pointer accent-[#0891b2]"
            />
            <span className="text-xs text-[#22d3ee] w-10">{minScore}%+</span>
            {minScore > 0 && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setMinScore(0)}
                className="text-xs text-[#64748b] hover:text-white cursor-default"
              >
                重置
              </motion.button>
            )}
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#94a3b8]">排序:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "score" | "name" | "experience")}
              className="bg-[#0a0f1a] border border-[#334155] rounded px-2 py-1 text-xs text-[#cbd5e1] focus:outline-none focus:border-[#0891b2]"
            >
              <option value="score">评分最高</option>
              <option value="name">姓名排序</option>
              <option value="experience">经验最多</option>
            </select>
          </div>

          {/* Tag Filters */}
          {allTags.length > 0 && !batchMode && (
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <motion.button
                  key={tag}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedTags.includes(tag)
                      ? "bg-[#0891b2] text-white"
                      : "bg-[#0a0f1a] text-[#94a3b8] border border-[#334155] hover:border-[#0891b2]"
                  }`}
                >
                  {tag}
                </motion.button>
              ))}
              {selectedTags.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedTags([])}
                  className="px-3 py-1.5 text-xs text-[#94a3b8] hover:text-white transition-colors cursor-default"
                >
                  清除
                </motion.button>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Batch Action Toolbar */}
      {batchMode && batchSelected.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#7c3aed]/30 border border-[#7c3aed]/30 rounded-xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="text-[#c4b5fd] text-sm font-medium">
              已选择 {batchSelected.length} 位候选人
            </span>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                batchSelected.forEach(name => {
                  const c = allCandidates.find(a => a.candidate_name === name);
                  if (c) handleStatusChange(c, "interview");
                });
                setBatchSelected([]);
              }}
              className="px-4 py-2 bg-[#10b981]/20 text-[#34d399] border border-[#10b981]/30 rounded-lg hover:bg-[#10b981]/30 transition-colors text-sm"
            >
              批量面试
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                // Export selected candidates
                const selected = allCandidates.filter(c => batchSelected.includes(c.candidate_name));
                const data = JSON.stringify(selected, null, 2);
                const blob = new Blob([data], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `candidates-batch-${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
                setBatchSelected([]);
              }}
              className="px-4 py-2 bg-[#0891b2]/20 text-[#22d3ee] border border-[#0891b2]/30 rounded-lg hover:bg-[#0891b2]/30 transition-colors text-sm"
            >
              导出选中
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setBatchSelected([])}
              className="px-4 py-2 bg-[#64748b]/20 text-[#94a3b8] border border-[#64748b]/30 rounded-lg hover:bg-[#64748b]/30 transition-colors text-sm"
            >
              取消
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1f2937] rounded-xl p-4 border border-[#334155]"
        >
          <motion.h3
            whileHover={{ scale: 1.02 }}
            className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wider mb-3 flex items-center gap-2 cursor-default"
          >
            最近查看
          </motion.h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {recentlyViewed.map((candidate, i) => (
              <motion.button
                key={`${candidate.candidate_name}-${i}`}
                whileHover={{ scale: 1.05, borderColor: "rgba(34, 211, 238, 0.5)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedCandidate(candidate);
                  addToRecentlyViewed(candidate);
                }}
                className="flex-shrink-0 bg-[#0a0f1a] rounded-lg p-3 border border-[#334155] hover:border-[#0891b2]/50 transition-colors flex items-center gap-3 min-w-[200px]"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  candidate.match_score >= 80 ? "bg-[#10b981]/20 text-[#34d399]" :
                  candidate.match_score >= 60 ? "bg-[#f59e0b]/20 text-[#fbbf24]" :
                  "bg-[#ef4444]/20 text-[#f87171]"
                }`}>
                  {candidate.match_score}
                </div>
                <div className="text-left">
                  <p className="text-sm text-[#f8fafc] font-medium truncate max-w-[120px]">{candidate.candidate_name}</p>
                  <p className="text-xs text-[#64748b] truncate max-w-[120px]">{candidate.current_company || "未填写公司"}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Statistics Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1f2937] rounded-xl p-4 border border-[#334155]"
      >
        <motion.h3
          whileHover={{ scale: 1.02 }}
          className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wider mb-3 flex items-center gap-2 cursor-default"
        >
          候选人统计
        </motion.h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div whileHover={{ scale: 1.05 }} className="bg-[#0a0f1a] rounded-lg p-3 text-center cursor-default border border-[#334155]">
            <div className="text-2xl font-bold text-[#22d3ee]">{candidateStats.avgScore}%</div>
            <div className="text-xs text-[#64748b] mt-1">平均匹配度</div>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="bg-[#0a0f1a] rounded-lg p-3 text-center cursor-default border border-[#334155]">
            <div className="text-2xl font-bold text-[#34d399]">{candidateStats.scoreDistribution.high}</div>
            <div className="text-xs text-[#64748b] mt-1">高分候选人(≥80)</div>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="bg-[#0a0f1a] rounded-lg p-3 text-center cursor-default border border-[#334155]">
            <div className="text-2xl font-bold text-[#fbbf24]">{candidateStats.scoreDistribution.medium}</div>
            <div className="text-xs text-[#64748b] mt-1">中等候选人(60-79)</div>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="bg-[#0a0f1a] rounded-lg p-3 text-center cursor-default border border-[#334155]">
            <div className="text-2xl font-bold text-[#94a3b8]">{candidateStats.companies}</div>
            <div className="text-xs text-[#64748b] mt-1">涉及公司数</div>
          </motion.div>
        </div>
        {candidateStats.topTags.length > 0 && (
          <div className="mt-4">
            <motion.span whileHover={{ scale: 1.05 }} className="text-xs text-[#64748b] mb-2 inline-block cursor-default">热门标签:</motion.span>
            <div className="flex flex-wrap gap-2">
              {candidateStats.topTags.map(([tag, count]) => (
                <motion.span
                  key={tag}
                  whileHover={{ scale: 1.1, boxShadow: "0 0 8px rgba(34, 211, 238, 0.4)" }}
                  className="bg-[#0891b2]/20 text-[#22d3ee] px-2 py-1 rounded-full text-xs flex items-center gap-1 cursor-default border border-[#0891b2]/30"
                >
                  {tag}
                  <span className="bg-[#0891b2]/40 px-1 rounded text-[10px]">{count}</span>
                </motion.span>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* 强烈推荐 */}
      {sortedFilteredStrong.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#1f2937] rounded-xl shadow-lg border border-[#334155] overflow-hidden"
        >
          <div className="bg-gradient-to-r from-[#10b981] to-[#059669] px-6 py-4">
            <motion.h3
              whileHover={{ scale: 1.02 }}
              className="text-lg font-semibold text-white flex items-center gap-2 cursor-default"
            >
              强烈推荐 ({sortedFilteredStrong.length}份)
            </motion.h3>
          </div>
          <div className="p-6 space-y-4">
            {sortedFilteredStrong.map((candidate, index) => (
              <motion.div
                key={candidate.candidate_name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.01, borderColor: "#10B981" }}
                onClick={() => {
                  if (batchMode) {
                    setBatchSelected(prev =>
                      prev.includes(candidate.candidate_name)
                        ? prev.filter(n => n !== candidate.candidate_name)
                        : [...prev, candidate.candidate_name]
                    );
                  } else {
                    setSelectedCandidate(candidate);
                    addToRecentlyViewed(candidate);
                  }
                }}
                className={`border rounded-lg p-5 hover:shadow-lg transition-all bg-[#0a0f1a] cursor-pointer border-[#334155] ${
                  batchMode
                    ? "hover:border-[#7c3aed]"
                    : ""
                } ${batchSelected.includes(candidate.candidate_name) ? "border-[#7c3aed] bg-[#7c3aed]/10" : ""}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {batchMode ? (
                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                          batchSelected.includes(candidate.candidate_name)
                            ? "bg-[#7c3aed] border-[#7c3aed]"
                            : "border-[#64748b]"
                        }`}>
                          {batchSelected.includes(candidate.candidate_name) && (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      ) : (
                        <span className="w-8 h-8 bg-[#10b981]/20 text-[#34d399] rounded-full flex items-center justify-center font-bold text-sm border border-[#10b981]/30">
                          {index + 1}
                        </span>
                      )}
                      <div>
                        <h4 className="font-semibold text-[#f8fafc] text-lg">
                          {candidate.candidate_name}
                        </h4>
                        {candidate.years_experience && (
                          <p className="text-sm text-[#94a3b8]">
                            {candidate.years_experience}年经验
                          </p>
                        )}
                      </div>
                    </div>
                    {candidate.current_company && (
                      <p className="text-sm text-[#94a3b8] mt-2 flex items-center gap-1">
                        {candidate.current_company}
                      </p>
                    )}
                    {candidate.source && (
                      <div className="flex items-center gap-1 mt-2">
                        <span className="text-xs px-2 py-0.5 bg-[#475569]/20 text-[#94a3b8] rounded border border-[#475569]/30">
                          {candidate.source === "referral" && "内推"}
                          {candidate.source === "headhunter" && "猎头"}
                          {candidate.source === "website" && "网站"}
                          {candidate.source === "resume_db" && "简历库"}
                          {candidate.source === "other" && "其他"}
                        </span>
                        {candidate.source_name && (
                          <span className="text-xs text-[#64748b]">- {candidate.source_name}</span>
                        )}
                      </div>
                    )}
                    <p className="text-[#94a3b8] text-sm mt-3">{candidate.summary}</p>
                    {getAllTags(candidate).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {getAllTags(candidate).slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-[#0891b2]/20 text-[#22d3ee] rounded-full border border-[#0891b2]/30">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {notes.get(candidate.candidate_name) && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-[#64748b]">
                        <span>📝</span>
                        <span className="truncate max-w-[150px]">{notes.get(candidate.candidate_name)?.slice(0, 30)}</span>
                      </div>
                    )}
                    <motion.p
                      whileHover={{ scale: 1.02 }}
                      className="text-[#22d3ee] text-xs mt-2 bg-[#0891b2]/10 hover:bg-[#0891b2]/20 px-2 py-1 rounded transition-colors inline-flex items-center gap-1 cursor-default"
                    >
                      点击查看详情
                    </motion.p>
                  </div>
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className={`bg-gradient-to-br ${getScoreBg(candidate.match_score)} rounded-xl p-4 text-center min-w-[100px] border border-[#334155] flex flex-col items-center gap-2`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const isStarred = starred.has(candidate.candidate_name);
                        setStarred(prev => {
                          const next = new Set(prev);
                          if (isStarred) {
                            next.delete(candidate.candidate_name);
                          } else {
                            next.add(candidate.candidate_name);
                          }
                          return next;
                        });
                        logActivity(isStarred ? "取消收藏" : "添加收藏", candidate.candidate_name);
                      }}
                      className={`text-xl transition-colors ${starred.has(candidate.candidate_name) ? "text-[#fbbf24]" : "text-[#64748b] hover:text-[#fbbf24]"}`}
                    >
                      {starred.has(candidate.candidate_name) ? "★" : "☆"}
                    </button>
                    <div className={`text-3xl font-bold ${getScoreColor(candidate.match_score)}`}>
                      {candidate.match_score}%
                    </div>
                    <div className="mt-2">{getLevelBadge(candidate.level)}</div>
                    {/* Quick Action Buttons */}
                    <div className="flex gap-1 mt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyCandidateInfo(candidate);
                        }}
                        className="p-1.5 text-[#64748b] hover:text-[#22d3ee] transition-colors rounded hover:bg-[#334155]"
                        title="复制信息"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const link = generateShareLink(candidate);
                          navigator.clipboard.writeText(link);
                          logActivity("生成分享链接", candidate.candidate_name);
                        }}
                        className="p-1.5 text-[#64748b] hover:text-[#a78bfa] transition-colors rounded hover:bg-[#334155]"
                        title="生成分享链接"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </button>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 可备选 */}
      {sortedFilteredBackup.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[#1f2937] rounded-xl shadow-lg border border-[#334155] overflow-hidden"
        >
          <div className="bg-gradient-to-r from-[#f59e0b] to-[#d97706] px-6 py-4">
            <motion.h3
              whileHover={{ scale: 1.02 }}
              className="text-lg font-semibold text-[#78350f] flex items-center gap-2 cursor-default"
            >
              可备选 ({sortedFilteredBackup.length}份)
            </motion.h3>
          </div>
          <div className="p-6 space-y-4">
            {sortedFilteredBackup.map((candidate, index) => (
              <motion.div
                key={candidate.candidate_name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ scale: 1.01, borderColor: "#F59E0B" }}
                onClick={() => {
                  if (batchMode) {
                    setBatchSelected(prev =>
                      prev.includes(candidate.candidate_name)
                        ? prev.filter(n => n !== candidate.candidate_name)
                        : [...prev, candidate.candidate_name]
                    );
                  } else {
                    setSelectedCandidate(candidate);
                    addToRecentlyViewed(candidate);
                  }
                }}
                className={`border rounded-lg p-5 hover:shadow-lg transition-all bg-[#0a0f1a] cursor-pointer border-[#334155] ${
                  batchMode
                    ? "hover:border-[#7c3aed]"
                    : ""
                } ${batchSelected.includes(candidate.candidate_name) ? "border-[#7c3aed] bg-[#7c3aed]/10" : ""}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {batchMode ? (
                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                          batchSelected.includes(candidate.candidate_name)
                            ? "bg-[#7c3aed] border-[#7c3aed]"
                            : "border-[#64748b]"
                        }`}>
                          {batchSelected.includes(candidate.candidate_name) && (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      ) : (
                        <span className="w-8 h-8 bg-[#f59e0b]/20 text-[#fbbf24] rounded-full flex items-center justify-center font-bold text-sm border border-[#f59e0b]/30">
                          {index + 1}
                        </span>
                      )}
                      <div>
                        <h4 className="font-semibold text-[#f8fafc] text-lg">
                          {candidate.candidate_name}
                        </h4>
                        {candidate.years_experience && (
                          <p className="text-sm text-[#94a3b8]">
                            {candidate.years_experience}年经验
                          </p>
                        )}
                      </div>
                    </div>
                    {candidate.current_company && (
                      <p className="text-sm text-[#94a3b8] mt-2 flex items-center gap-1">
                        {candidate.current_company}
                      </p>
                    )}
                    {candidate.source && (
                      <div className="flex items-center gap-1 mt-2">
                        <span className="text-xs px-2 py-0.5 bg-[#475569]/20 text-[#94a3b8] rounded border border-[#475569]/30">
                          {candidate.source === "referral" && "内推"}
                          {candidate.source === "headhunter" && "猎头"}
                          {candidate.source === "website" && "网站"}
                          {candidate.source === "resume_db" && "简历库"}
                          {candidate.source === "other" && "其他"}
                        </span>
                        {candidate.source_name && (
                          <span className="text-xs text-[#64748b]">- {candidate.source_name}</span>
                        )}
                      </div>
                    )}
                    <p className="text-[#94a3b8] text-sm mt-3">{candidate.summary}</p>
                    {getAllTags(candidate).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {getAllTags(candidate).slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-[#f59e0b]/20 text-[#fbbf24] rounded-full border border-[#f59e0b]/30">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <motion.p
                      whileHover={{ scale: 1.02 }}
                      className="text-[#22d3ee] text-xs mt-2 bg-[#0891b2]/10 hover:bg-[#0891b2]/20 px-2 py-1 rounded transition-colors inline-flex items-center gap-1 cursor-default"
                    >
                      点击查看详情
                    </motion.p>
                  </div>
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.1 + 0.2 }}
                    className={`bg-gradient-to-br ${getScoreBg(candidate.match_score)} rounded-xl p-4 text-center min-w-[100px] border border-[#334155] flex flex-col items-center gap-2`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const isStarred = starred.has(candidate.candidate_name);
                        setStarred(prev => {
                          const next = new Set(prev);
                          if (isStarred) {
                            next.delete(candidate.candidate_name);
                          } else {
                            next.add(candidate.candidate_name);
                          }
                          return next;
                        });
                        logActivity(isStarred ? "取消收藏" : "添加收藏", candidate.candidate_name);
                      }}
                      className={`text-xl transition-colors ${starred.has(candidate.candidate_name) ? "text-[#fbbf24]" : "text-[#64748b] hover:text-[#fbbf24]"}`}
                    >
                      {starred.has(candidate.candidate_name) ? "★" : "☆"}
                    </button>
                    <div className={`text-3xl font-bold ${getScoreColor(candidate.match_score)}`}>
                      {candidate.match_score}%
                    </div>
                    <div className="mt-2">{getLevelBadge(candidate.level)}</div>
                    {/* Quick Action Buttons */}
                    <div className="flex gap-1 mt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyCandidateInfo(candidate);
                        }}
                        className="p-1.5 text-[#64748b] hover:text-[#22d3ee] transition-colors rounded hover:bg-[#334155]"
                        title="复制信息"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const link = generateShareLink(candidate);
                          navigator.clipboard.writeText(link);
                          logActivity("生成分享链接", candidate.candidate_name);
                        }}
                        className="p-1.5 text-[#64748b] hover:text-[#a78bfa] transition-colors rounded hover:bg-[#334155]"
                        title="生成分享链接"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </button>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 操作日志 */}
      {activityLog.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="bg-[#1f2937] rounded-xl shadow-lg border border-[#334155] overflow-hidden"
        >
          <div className="bg-gradient-to-r from-[#475569] to-[#334155] px-6 py-4 flex justify-between items-center">
            <motion.h3
              whileHover={{ scale: 1.02 }}
              className="text-lg font-semibold text-[#f8fafc] flex items-center gap-2 cursor-default"
            >
              操作日志 ({activityLog.length})
            </motion.h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActivityLog([])}
              className="text-xs text-[#94a3b8] hover:text-[#ef4444] transition-colors"
            >
              清空日志
            </motion.button>
          </div>
          <div className="p-4 max-h-48 overflow-y-auto">
            <div className="space-y-2">
              {activityLog.slice(0, 10).map((log, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <span className="text-[#64748b] w-16 flex-shrink-0">{log.time}</span>
                  <span className="text-[#22d3ee] w-32 flex-shrink-0 truncate">{log.candidate}</span>
                  <span className="text-[#cbd5e1]">{log.action}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* 筛选标准 */}
      {criteria.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-[#1f2937] rounded-xl shadow-lg border border-[#334155] overflow-hidden"
        >
          <div className="bg-gradient-to-r from-[#475569] to-[#334155] px-6 py-4 flex justify-between items-center">
            <motion.h3
              whileHover={{ scale: 1.02 }}
              className="text-lg font-semibold text-[#f8fafc] flex items-center gap-2 cursor-default"
            >
              筛选标准
            </motion.h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigator.clipboard.writeText(criteria.join("\n"))}
              className="text-xs text-[#94a3b8] hover:text-[#22d3ee] transition-colors flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              复制
            </motion.button>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-2">
              {criteria.map((criterion, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-[#0a0f1a] text-[#cbd5e1] px-4 py-2 rounded-full text-sm flex items-center gap-2 border border-[#334155] cursor-default"
                >
                  <span className="w-2 h-2 bg-[#0891b2] rounded-full"></span>
                  {criterion}
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}