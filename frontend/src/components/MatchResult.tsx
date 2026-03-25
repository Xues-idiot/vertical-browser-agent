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
}

interface MatchResultProps {
  strongRecommendations: Candidate[];
  backupCandidates: Candidate[];
  criteria: string[];
}

type CandidateStatus = "pending" | "interview" | "offer" | "rejected";

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

        {/* Footer */}
        <div className="bg-[#111827] px-6 py-4 border-t border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            关闭
          </button>
          <button
            onClick={() => {
              // Export candidate as JSON
              const data = JSON.stringify({ ...candidate, note, status }, null, 2);
              const blob = new Blob([data], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `candidate-${candidate.candidate_name}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
          >
            导出候选人
          </button>
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
    console.log(`Candidate ${candidate.candidate_name} status changed to ${status}`);
    // In production, this would update via API
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

      {/* 强烈推荐 */}
      {strongRecommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#1F2937] rounded-xl shadow-lg border border-gray-700 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>⭐</span> 强烈推荐 ({strongRecommendations.length}份)
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {strongRecommendations.map((candidate, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.01, borderColor: "#10B981" }}
                onClick={() => setSelectedCandidate(candidate)}
                className="border border-gray-700 rounded-lg p-5 hover:shadow-lg transition-all bg-[#111827] cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-8 h-8 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center font-bold text-sm border border-emerald-500/30">
                        {index + 1}
                      </span>
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
                    <p className="text-gray-400 text-sm mt-3">{candidate.summary}</p>
                    {candidate.tags && candidate.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {candidate.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-500/30">
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
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className={`bg-gradient-to-br ${getScoreBg(candidate.match_score)} rounded-xl p-4 text-center min-w-[100px] border border-gray-700`}
                  >
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
      {backupCandidates.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[#1F2937] rounded-xl shadow-lg border border-gray-700 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
            <h3 className="text-lg font-semibold text-amber-900 flex items-center gap-2">
              <span>🟡</span> 可备选 ({backupCandidates.length}份)
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {backupCandidates.map((candidate, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ scale: 1.01, borderColor: "#F59E0B" }}
                onClick={() => setSelectedCandidate(candidate)}
                className="border border-gray-700 rounded-lg p-5 hover:shadow-lg transition-all bg-[#111827] cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-8 h-8 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center font-bold text-sm border border-amber-500/30">
                        {index + 1}
                      </span>
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
                    <p className="text-gray-400 text-sm mt-3">{candidate.summary}</p>
                    {candidate.tags && candidate.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {candidate.tags.slice(0, 3).map((tag, i) => (
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
                    className={`bg-gradient-to-br ${getScoreBg(candidate.match_score)} rounded-xl p-4 text-center min-w-[100px] border border-gray-700`}
                  >
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