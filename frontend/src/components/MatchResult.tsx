"use client";

import { useState } from "react";
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
}

interface MatchResultProps {
  strongRecommendations: Candidate[];
  backupCandidates: Candidate[];
  criteria: string[];
}

type CandidateStatus = "pending" | "interview" | "offer" | "rejected";

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
  onClose,
  onStatusChange,
}: {
  candidate: Candidate;
  criteria: string[];
  onClose: () => void;
  onStatusChange: (status: CandidateStatus) => void;
}) {
  const [status, setStatus] = useState<CandidateStatus>("pending");
  const [note, setNote] = useState("");

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-red-400";
  };

  const statusOptions: { value: CandidateStatus; label: string; color: string }[] = [
    { value: "pending", label: "待沟通", color: "bg-gray-600" },
    { value: "interview", label: "面试中", color: "bg-amber-500" },
    { value: "offer", label: "Offer", color: "bg-emerald-500" },
    { value: "rejected", label: "淘汰", color: "bg-red-500" },
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
        className="bg-[#1F2937] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 px-6 py-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-white">{candidate.candidate_name}</h2>
              <p className="text-cyan-100 text-sm mt-1">
                {candidate.years_experience && `${candidate.years_experience}年经验`}
                {candidate.current_company && ` · ${candidate.current_company}`}
              </p>
            </div>
            <div className={`text-4xl font-bold ${getScoreColor(candidate.match_score)}`}>
              {candidate.match_score}%
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Match Score Breakdown */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              匹配度分析
            </h3>
            <div className="bg-[#111827] rounded-xl p-4 border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 bg-gray-700 rounded-full h-4 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${candidate.match_score}%` }}
                    transition={{ duration: 0.8 }}
                    className={`h-full rounded-full ${
                      candidate.match_score >= 80
                        ? "bg-emerald-500"
                        : candidate.match_score >= 60
                        ? "bg-amber-500"
                        : "bg-red-500"
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
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    评分明细
                  </h4>
                  {candidate.score_breakdown.hard_conditions !== undefined && (
                    <div className="flex items-center gap-3">
                      <span className="w-20 text-xs text-gray-400">硬性条件</span>
                      <div className="flex-1 bg-gray-700/50 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${candidate.score_breakdown.hard_conditions}%` }}
                          transition={{ duration: 0.8, delay: 0.1 }}
                          className="h-full bg-cyan-500 rounded-full"
                        />
                      </div>
                      <span className="w-10 text-xs text-cyan-400 font-medium">
                        {candidate.score_breakdown.hard_conditions}%
                      </span>
                    </div>
                  )}
                  {candidate.score_breakdown.skill_match !== undefined && (
                    <div className="flex items-center gap-3">
                      <span className="w-20 text-xs text-gray-400">技能匹配</span>
                      <div className="flex-1 bg-gray-700/50 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${candidate.score_breakdown.skill_match}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className="h-full bg-emerald-500 rounded-full"
                        />
                      </div>
                      <span className="w-10 text-xs text-emerald-400 font-medium">
                        {candidate.score_breakdown.skill_match}%
                      </span>
                    </div>
                  )}
                  {candidate.score_breakdown.industry_exp !== undefined && (
                    <div className="flex items-center gap-3">
                      <span className="w-20 text-xs text-gray-400">行业经验</span>
                      <div className="flex-1 bg-gray-700/50 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${candidate.score_breakdown.industry_exp}%` }}
                          transition={{ duration: 0.8, delay: 0.3 }}
                          className="h-full bg-amber-500 rounded-full"
                        />
                      </div>
                      <span className="w-10 text-xs text-amber-400 font-medium">
                        {candidate.score_breakdown.industry_exp}%
                      </span>
                    </div>
                  )}
                  {candidate.score_breakdown.potential !== undefined && (
                    <div className="flex items-center gap-3">
                      <span className="w-20 text-xs text-gray-400">发展潜力</span>
                      <div className="flex-1 bg-gray-700/50 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${candidate.score_breakdown.potential}%` }}
                          transition={{ duration: 0.8, delay: 0.4 }}
                          className="h-full bg-purple-500 rounded-full"
                        />
                      </div>
                      <span className="w-10 text-xs text-purple-400 font-medium">
                        {candidate.score_breakdown.potential}%
                      </span>
                    </div>
                  )}
                </div>
              )}

              <p className="text-gray-300 text-sm mt-4">{candidate.summary}</p>
            </div>
          </div>

          {/* Matched Criteria */}
          {candidate.matched_criteria && candidate.matched_criteria.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                匹配的标准
              </h3>
              <div className="flex flex-wrap gap-2">
                {candidate.matched_criteria.map((c, i) => (
                  <span
                    key={i}
                    className="bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full text-sm border border-emerald-500/30 flex items-center gap-1"
                  >
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Screening Criteria Reference */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              筛选标准 (JD要求)
            </h3>
            <div className="flex flex-wrap gap-2">
              {criteria.map((c, i) => (
                <span
                  key={i}
                  className="bg-[#111827] text-gray-300 px-3 py-1.5 rounded-full text-sm border border-gray-700 flex items-center gap-1"
                >
                  <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* AI推荐理由 */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              AI推荐理由
            </h3>
            <div className="bg-gradient-to-r from-purple-900/30 to-purple-900/10 rounded-xl p-4 border border-purple-500/30">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🤖</span>
                <div className="flex-1">
                  <p className="text-gray-200 text-sm leading-relaxed">
                    {candidate.ai_reason || generateAIRecommendation(candidate)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 关键经历亮点 */}
          {(candidate.key_highlights || generateKeyHighlights(candidate)).length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                关键经历亮点
              </h3>
              <div className="space-y-2">
                {(candidate.key_highlights || generateKeyHighlights(candidate)).map((highlight, i) => (
                  <div key={i} className="flex items-start gap-2 bg-[#111827] rounded-lg p-3 border border-gray-700">
                    <span className="w-5 h-5 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-gray-300 text-sm">{highlight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resume Text Preview */}
          {candidate.resume_text && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                简历摘要
              </h3>
              <div className="bg-[#111827] rounded-xl p-4 border border-gray-700">
                <p className="text-gray-300 text-sm whitespace-pre-wrap">
                  {candidate.resume_text.slice(0, 500)}
                  {candidate.resume_text.length > 500 && "..."}
                </p>
              </div>
            </div>
          )}

          {/* 评分历史 */}
          {(candidate.score_history || generateMockScoreHistory(candidate)).length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                📈 评分历史
              </h3>
              <div className="bg-[#111827] rounded-xl p-4 border border-gray-700">
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
                          className={`w-full rounded-t-sm ${isLatest ? "bg-cyan-500" : "bg-gray-600"}`}
                        />
                        <span className="text-xs text-gray-500">
                          {new Date(entry.date).toLocaleDateString().slice(5)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>早期评估</span>
                  <span>最近评估: <span className="text-cyan-400">{candidate.match_score}%</span></span>
                </div>
              </div>
            </div>
          )}

          {/* Status Management */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              候选人状态
            </h3>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setStatus(opt.value);
                    onStatusChange(opt.value);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    status === opt.value
                      ? `${opt.color} text-white shadow-lg`
                      : "bg-[#111827] text-gray-400 border border-gray-700 hover:border-gray-500"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 相似候选人 */}
          {(candidate.similar_candidates || []).length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                👥 相似候选人
              </h3>
              <div className="space-y-2">
                {candidate.similar_candidates?.slice(0, 3).map((similar, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      // Switch to this similar candidate
                      onClose();
                      // The parent would need to handle this
                    }}
                    className="w-full flex items-center justify-between bg-[#111827] rounded-lg p-3 border border-gray-700 hover:border-cyan-500/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-gray-600/50 text-gray-400 rounded-full flex items-center justify-center text-xs">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm text-white font-medium">{similar.candidate_name}</p>
                        <p className="text-xs text-gray-400">{similar.current_company}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${getScoreColor(similar.match_score)}`}>
                      {similar.match_score}%
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Interview Feedback */}
          {(candidate.interviews || []).length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                面试反馈 ({candidate.interviews?.length}轮)
              </h3>
              <div className="space-y-3">
                {candidate.interviews?.map((interview, i) => (
                  <div key={i} className="bg-[#111827] rounded-lg p-3 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-cyan-400">第{interview.round}轮面试</span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, si) => (
                          <span key={si} className={`text-sm ${si < interview.rating ? "text-amber-400" : "text-gray-600"}`}>★</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mb-1">{interview.date}</p>
                    <p className="text-sm text-gray-300">{interview.feedback}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              备注
            </h3>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="添加备注信息..."
              className="w-full bg-[#111827] border border-gray-700 rounded-xl px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Footer - Quick Actions */}
        <div className="bg-[#111827] px-6 py-4 border-t border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">快捷操作</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setStatus("interview");
                onStatusChange("interview");
              }}
              className="px-4 py-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-600/30 transition-colors text-sm flex items-center gap-2"
            >
              📅 安排面试
            </button>
            <button
              onClick={() => {
                const subject = encodeURIComponent(`【Spider招聘】关于${candidate.candidate_name}的面试邀请`);
                window.open(`mailto:?subject=${subject}`);
              }}
              className="px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 transition-colors text-sm flex items-center gap-2"
            >
              ✉️ 发送邮件
            </button>
            <button
              onClick={() => {
                setStatus("offer");
                onStatusChange("offer");
              }}
              className="px-4 py-2 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-600/30 transition-colors text-sm flex items-center gap-2"
            >
              🎯 发放Offer
            </button>
            <button
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
              className="px-4 py-2 bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-600/30 transition-colors text-sm flex items-center gap-2"
            >
              📥 导出
            </button>
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
  const [minScore, setMinScore] = useState<number>(0);
  const [notes, setNotes] = useState<Map<string, string>>(new Map());
  const [sortBy, setSortBy] = useState<"score" | "name" | "experience">("score");
  const [customTags, setCustomTags] = useState<Map<string, string[]>>(new Map());
  const [activityLog, setActivityLog] = useState<{ time: string; action: string; candidate: string }[]>([]);

  // Add custom tag to candidate
  const addTagToCandidate = (candidateName: string, tag: string) => {
    setCustomTags(prev => {
      const next = new Map(prev);
      const existing = next.get(candidateName) || [];
      if (!existing.includes(tag)) {
        next.set(candidateName, [...existing, tag]);
      }
      return next;
    });
  };

  // Get all tags for a candidate (built-in + custom)
  const getAllTags = (candidate: Candidate) => {
    return [...(candidate.tags || []), ...(customTags.get(candidate.candidate_name) || [])];
  };

  // Combine all candidates
  const allCandidates = [...strongRecommendations, ...backupCandidates];

  // Extract all unique tags (including custom tags)
  const allTags = Array.from(
    new Set([
      ...allCandidates.flatMap((c) => c.tags || []),
      ...Array.from(customTags.values()).flat()
    ])
  );

  // Filter candidates
  const filteredStrong = strongRecommendations.filter((c) => {
    const matchesSearch =
      !searchQuery ||
      c.candidate_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.current_company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tag) => getAllTags(c).includes(tag));
    const matchesStarred = !showOnlyStarred || starred.has(c.candidate_name);
    const matchesScore = c.match_score >= minScore;
    return matchesSearch && matchesTags && matchesStarred && matchesScore;
  });

  const filteredBackup = backupCandidates.filter((c) => {
    const matchesSearch =
      !searchQuery ||
      c.candidate_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.current_company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tag) => getAllTags(c).includes(tag));
    const matchesStarred = !showOnlyStarred || starred.has(c.candidate_name);
    const matchesScore = c.match_score >= minScore;
    return matchesSearch && matchesTags && matchesStarred && matchesScore;
  });

  // Sort candidates
  const sortCandidates = (candidates: Candidate[]) => {
    return [...candidates].sort((a, b) => {
      if (sortBy === "score") return b.match_score - a.match_score;
      if (sortBy === "name") return a.candidate_name.localeCompare(b.candidate_name, "zh-CN");
      if (sortBy === "experience") return (b.years_experience || 0) - (a.years_experience || 0);
      return 0;
    });
  };

  const sortedFilteredStrong = sortCandidates(filteredStrong);
  const sortedFilteredBackup = sortCandidates(filteredBackup);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "strong_recommend":
        return (
          <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs px-3 py-1 rounded-full shadow-sm">
            ⭐ 强烈推荐
          </span>
        );
      case "backup":
        return (
          <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-amber-900 text-xs px-3 py-1 rounded-full shadow-sm">
            🟡 可备选
          </span>
        );
      default:
        return (
          <span className="bg-gray-600 text-gray-200 text-xs px-3 py-1 rounded-full">
            {level}
          </span>
        );
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "from-emerald-500/20 to-emerald-600/10";
    if (score >= 60) return "from-amber-500/20 to-amber-600/10";
    return "from-red-500/20 to-red-600/10";
  };

  const handleStatusChange = (candidate: Candidate, status: CandidateStatus) => {
    const statusLabels = { pending: "待沟通", interview: "面试中", offer: "Offer", rejected: "淘汰" };
    setActivityLog(prev => [{
      time: new Date().toLocaleTimeString(),
      action: `状态更新为"${statusLabels[status]}"`,
      candidate: candidate.candidate_name
    }, ...prev].slice(0, 50));
  };

  const logActivity = (action: string, candidate: string) => {
    setActivityLog(prev => [{
      time: new Date().toLocaleTimeString(),
      action,
      candidate
    }, ...prev].slice(0, 50));
  };

  return (
    <div className="space-y-6">
      {/* Candidate Detail Modal */}
      <AnimatePresence>
        {selectedCandidate && (
          <CandidateDetailModal
            candidate={selectedCandidate}
            criteria={criteria}
            onClose={() => setSelectedCandidate(null)}
            onStatusChange={(status) => handleStatusChange(selectedCandidate, status)}
          />
        )}
      </AnimatePresence>

      {/* Search & Filter */}
      <div className="bg-[#1F2937] rounded-xl p-4 border border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索候选人姓名、公司、摘要..."
              className="w-full bg-[#111827] border border-gray-700 rounded-lg px-4 py-2 pl-10 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Batch Mode Toggle */}
          <button
            onClick={() => {
              setBatchMode(!batchMode);
              setBatchSelected([]);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              batchMode
                ? "bg-purple-600 text-white"
                : "bg-[#111827] text-gray-400 border border-gray-700 hover:border-purple-500"
            }`}
          >
            {batchMode ? "✓ 退出批量" : "📋 批量操作"}
          </button>

          {/* Starred filter */}
          <button
            onClick={() => {
              setShowOnlyStarred(!showOnlyStarred);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              showOnlyStarred
                ? "bg-amber-600 text-white"
                : "bg-[#111827] text-gray-400 border border-gray-700 hover:border-amber-500"
            }`}
          >
            ★ 我的收藏 ({starred.size})
          </button>

          {/* Score Range Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">评分:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-24 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <span className="text-xs text-cyan-400 w-10">{minScore}%+</span>
            {minScore > 0 && (
              <button
                onClick={() => setMinScore(0)}
                className="text-xs text-gray-500 hover:text-white"
              >
                重置
              </button>
            )}
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">排序:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "score" | "name" | "experience")}
              className="bg-[#111827] border border-gray-700 rounded px-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-cyan-500"
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
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedTags.includes(tag)
                      ? "bg-cyan-600 text-white"
                      : "bg-[#111827] text-gray-400 border border-gray-700 hover:border-cyan-500"
                  }`}
                >
                  {tag}
                </button>
              ))}
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                >
                  清除
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Batch Action Toolbar */}
      {batchMode && batchSelected.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-purple-900/30 border border-purple-500/30 rounded-xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="text-purple-300 text-sm font-medium">
              已选择 {batchSelected.length} 位候选人
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                batchSelected.forEach(name => {
                  const c = allCandidates.find(a => a.candidate_name === name);
                  if (c) handleStatusChange(c, "interview");
                });
                setBatchSelected([]);
              }}
              className="px-4 py-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-600/30 transition-colors text-sm"
            >
              📅 批量面试
            </button>
            <button
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
              className="px-4 py-2 bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-600/30 transition-colors text-sm"
            >
              📥 导出选中
            </button>
            <button
              onClick={() => setBatchSelected([])}
              className="px-4 py-2 bg-gray-600/20 text-gray-400 border border-gray-500/30 rounded-lg hover:bg-gray-600/30 transition-colors text-sm"
            >
              取消
            </button>
          </div>
        </motion.div>
      )}

      {/* 强烈推荐 */}
      {sortedFilteredStrong.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#1F2937] rounded-xl shadow-lg border border-gray-700 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>⭐</span> 强烈推荐 ({sortedFilteredStrong.length}份)
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {sortedFilteredStrong.map((candidate, index) => (
              <motion.div
                key={index}
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
                  }
                }}
                className={`border rounded-lg p-5 hover:shadow-lg transition-all bg-[#111827] cursor-pointer ${
                  batchMode
                    ? "border-gray-700 hover:border-purple-500"
                    : "border-gray-700"
                } ${batchSelected.includes(candidate.candidate_name) ? "border-purple-500 bg-purple-900/10" : ""}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {batchMode ? (
                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                          batchSelected.includes(candidate.candidate_name)
                            ? "bg-purple-600 border-purple-600"
                            : "border-gray-500"
                        }`}>
                          {batchSelected.includes(candidate.candidate_name) && (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      ) : (
                        <span className="w-8 h-8 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center font-bold text-sm border border-emerald-500/30">
                          {index + 1}
                        </span>
                      )}
                      <div>
                        <h4 className="font-semibold text-white text-lg">
                          {candidate.candidate_name}
                        </h4>
                        {candidate.years_experience && (
                          <p className="text-sm text-gray-400">
                            {candidate.years_experience}年经验
                          </p>
                        )}
                      </div>
                    </div>
                    {candidate.current_company && (
                      <p className="text-sm text-gray-400 mt-2 flex items-center gap-1">
                        <span>🏢</span> {candidate.current_company}
                      </p>
                    )}
                    {candidate.source && (
                      <div className="flex items-center gap-1 mt-2">
                        <span className="text-xs px-2 py-0.5 bg-gray-500/20 text-gray-400 rounded border border-gray-500/30">
                          {candidate.source === "referral" && "👥 内推"}
                          {candidate.source === "headhunter" && "🎯 猎头"}
                          {candidate.source === "website" && "🌐 网站"}
                          {candidate.source === "resume_db" && "📁 简历库"}
                          {candidate.source === "other" && "📋 其他"}
                        </span>
                        {candidate.source_name && (
                          <span className="text-xs text-gray-500">- {candidate.source_name}</span>
                        )}
                      </div>
                    )}
                    <p className="text-gray-400 text-sm mt-3">{candidate.summary}</p>
                    {getAllTags(candidate).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {getAllTags(candidate).slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-500/30">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {notes.get(candidate.candidate_name) && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                        <span>📝</span>
                        <span className="truncate max-w-[150px]">{notes.get(candidate.candidate_name)?.slice(0, 30)}</span>
                      </div>
                    )}
                    <p className="text-cyan-400 text-xs mt-2 hover:underline">
                      点击查看详情 →
                    </p>
                  </div>
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className={`bg-gradient-to-br ${getScoreBg(candidate.match_score)} rounded-xl p-4 text-center min-w-[100px] border border-gray-700 flex flex-col items-center gap-2`}
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
                      className={`text-xl transition-colors ${starred.has(candidate.candidate_name) ? "text-amber-400" : "text-gray-500 hover:text-amber-300"}`}
                    >
                      {starred.has(candidate.candidate_name) ? "★" : "☆"}
                    </button>
                    <div className={`text-3xl font-bold ${getScoreColor(candidate.match_score)}`}>
                      {candidate.match_score}%
                    </div>
                    <div className="mt-2">{getLevelBadge(candidate.level)}</div>
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
          className="bg-[#1F2937] rounded-xl shadow-lg border border-gray-700 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
            <h3 className="text-lg font-semibold text-amber-900 flex items-center gap-2">
              <span>🟡</span> 可备选 ({sortedFilteredBackup.length}份)
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {sortedFilteredBackup.map((candidate, index) => (
              <motion.div
                key={index}
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
                  }
                }}
                className={`border rounded-lg p-5 hover:shadow-lg transition-all bg-[#111827] cursor-pointer ${
                  batchMode
                    ? "border-gray-700 hover:border-purple-500"
                    : "border-gray-700"
                } ${batchSelected.includes(candidate.candidate_name) ? "border-purple-500 bg-purple-900/10" : ""}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {batchMode ? (
                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                          batchSelected.includes(candidate.candidate_name)
                            ? "bg-purple-600 border-purple-600"
                            : "border-gray-500"
                        }`}>
                          {batchSelected.includes(candidate.candidate_name) && (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      ) : (
                        <span className="w-8 h-8 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center font-bold text-sm border border-amber-500/30">
                          {index + 1}
                        </span>
                      )}
                      <div>
                        <h4 className="font-semibold text-white text-lg">
                          {candidate.candidate_name}
                        </h4>
                        {candidate.years_experience && (
                          <p className="text-sm text-gray-400">
                            {candidate.years_experience}年经验
                          </p>
                        )}
                      </div>
                    </div>
                    {candidate.current_company && (
                      <p className="text-sm text-gray-400 mt-2 flex items-center gap-1">
                        <span>🏢</span> {candidate.current_company}
                      </p>
                    )}
                    {candidate.source && (
                      <div className="flex items-center gap-1 mt-2">
                        <span className="text-xs px-2 py-0.5 bg-gray-500/20 text-gray-400 rounded border border-gray-500/30">
                          {candidate.source === "referral" && "👥 内推"}
                          {candidate.source === "headhunter" && "🎯 猎头"}
                          {candidate.source === "website" && "🌐 网站"}
                          {candidate.source === "resume_db" && "📁 简历库"}
                          {candidate.source === "other" && "📋 其他"}
                        </span>
                        {candidate.source_name && (
                          <span className="text-xs text-gray-500">- {candidate.source_name}</span>
                        )}
                      </div>
                    )}
                    <p className="text-gray-400 text-sm mt-3">{candidate.summary}</p>
                    {getAllTags(candidate).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {getAllTags(candidate).slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-cyan-400 text-xs mt-2 hover:underline">
                      点击查看详情 →
                    </p>
                  </div>
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.1 + 0.2 }}
                    className={`bg-gradient-to-br ${getScoreBg(candidate.match_score)} rounded-xl p-4 text-center min-w-[100px] border border-gray-700 flex flex-col items-center gap-2`}
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
                      className={`text-xl transition-colors ${starred.has(candidate.candidate_name) ? "text-amber-400" : "text-gray-500 hover:text-amber-300"}`}
                    >
                      {starred.has(candidate.candidate_name) ? "★" : "☆"}
                    </button>
                    <div className={`text-3xl font-bold ${getScoreColor(candidate.match_score)}`}>
                      {candidate.match_score}%
                    </div>
                    <div className="mt-2">{getLevelBadge(candidate.level)}</div>
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
          className="bg-[#1F2937] rounded-xl shadow-lg border border-gray-700 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>📜</span> 操作日志
            </h3>
          </div>
          <div className="p-4 max-h-48 overflow-y-auto">
            <div className="space-y-2">
              {activityLog.slice(0, 10).map((log, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <span className="text-gray-500 w-16 flex-shrink-0">{log.time}</span>
                  <span className="text-cyan-400 w-32 flex-shrink-0 truncate">{log.candidate}</span>
                  <span className="text-gray-300">{log.action}</span>
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
          className="bg-[#1F2937] rounded-xl shadow-lg border border-gray-700 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>💡</span> 筛选标准
            </h3>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-2">
              {criteria.map((criterion, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="bg-[#111827] text-gray-300 px-4 py-2 rounded-full text-sm flex items-center gap-2 border border-gray-700"
                >
                  <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
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