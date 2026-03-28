"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Candidate {
  candidate_name: string;
  match_score: number;
  level: string;
  summary: string;
  current_company?: string;
  years_experience?: number;
  score_breakdown?: {
    hard_conditions?: number;
    skill_match?: number;
    industry_exp?: number;
    potential?: number;
  };
  tags?: string[];
  matched_criteria?: string[];
}

interface CandidateComparisonProps {
  candidates: Candidate[];
  criteria: string[];
  onClose: () => void;
}

function CandidateCard({
  candidate,
  isSelected,
  onClick,
  rank,
}: {
  candidate: Candidate;
  isSelected: boolean;
  onClick: () => void;
  rank: number;
}) {
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

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`cursor-pointer rounded-xl border-2 transition-all ${
        isSelected
          ? "border-cyan-500 bg-cyan-500/10"
          : "border-gray-700 bg-[#111827] hover:border-gray-500"
      }`}
    >
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-6 h-6 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center text-xs font-bold">
            {rank}
          </span>
          <div className="flex-1">
            <h4 className="font-semibold text-white">{candidate.candidate_name}</h4>
            {candidate.current_company && (
              <p className="text-xs text-gray-400">{candidate.current_company}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.div whileHover={{ scale: 1.05 }} className={`px-3 py-1.5 rounded-lg bg-gradient-to-br ${getScoreBg(candidate.match_score)} border border-gray-700 shadow-lg`}>
            <span className={`text-xl font-bold ${getScoreColor(candidate.match_score)}`}>
              {candidate.match_score}
            </span>
            <span className="text-xs text-gray-400 ml-1">分</span>
          </motion.div>
          <span className={`text-xs px-2 py-1 rounded-full ${
            candidate.level === "strong_recommend"
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-amber-500/20 text-amber-400"
          }`}>
            {candidate.level === "strong_recommend" ? "⭐强烈推荐" : "🟡可备选"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function ComparisonTable({
  candidates,
  criteria,
}: {
  candidates: Candidate[];
  criteria: string[];
}) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-red-400";
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">维度</th>
            {candidates.map((c) => (
              <motion.th
                key={c.candidate_name}
                whileHover={{ backgroundColor: "rgba(55, 65, 81, 0.3)" }}
                className="text-left py-3 px-4 text-sm font-semibold text-white min-w-[150px]"
              >
                {c.candidate_name}
              </motion.th>
            ))}
          </tr>
        </thead>
        <tbody>
          <motion.tr
            whileHover={{ backgroundColor: "rgba(55, 65, 81, 0.2)" }}
            className="border-b border-gray-700/50 cursor-default"
          >
            <td className="py-3 px-4 text-sm text-gray-400">匹配分</td>
            {candidates.map((c) => (
              <td key={c.candidate_name} className="py-3 px-4">
                <span className={`text-lg font-bold ${getScoreColor(c.match_score)}`}>
                  {c.match_score}%
                </span>
              </td>
            ))}
          </motion.tr>
          <motion.tr
            whileHover={{ backgroundColor: "rgba(55, 65, 81, 0.2)" }}
            className="border-b border-gray-700/50 cursor-default"
          >
            <td className="py-3 px-4 text-sm text-gray-400">推荐等级</td>
            {candidates.map((c) => (
              <td key={c.candidate_name} className="py-3 px-4">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  c.level === "strong_recommend"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-amber-500/20 text-amber-400"
                }`}>
                  {c.level === "strong_recommend" ? "强烈推荐" : "可备选"}
                </span>
              </td>
            ))}
          </motion.tr>
          <motion.tr
            whileHover={{ backgroundColor: "rgba(55, 65, 81, 0.2)" }}
            className="border-b border-gray-700/50 cursor-default"
          >
            <td className="py-3 px-4 text-sm text-gray-400">当前公司</td>
            {candidates.map((c) => (
              <td key={c.candidate_name} className="py-3 px-4 text-sm text-gray-300">
                {c.current_company || "-"}
              </td>
            ))}
          </motion.tr>
          <motion.tr
            whileHover={{ backgroundColor: "rgba(55, 65, 81, 0.2)" }}
            className="border-b border-gray-700/50 cursor-default"
          >
            <td className="py-3 px-4 text-sm text-gray-400">工作年限</td>
            {candidates.map((c) => (
              <td key={c.candidate_name} className="py-3 px-4 text-sm text-gray-300">
                {c.years_experience ? `${c.years_experience}年` : "-"}
              </td>
            ))}
          </motion.tr>
          <motion.tr
            whileHover={{ backgroundColor: "rgba(55, 65, 81, 0.2)" }}
            className="border-b border-gray-700/50 cursor-default"
          >
            <td className="py-3 px-4 text-sm text-gray-400">匹配摘要</td>
            {candidates.map((c) => (
              <td key={c.candidate_name} className="py-3 px-4 text-sm text-gray-300">
                {c.summary}
              </td>
            ))}
          </motion.tr>
        </tbody>
      </table>
    </div>
  );
}

export default function CandidateComparison({
  candidates,
  criteria,
  onClose,
}: CandidateComparisonProps) {
  const [selectedCandidates, setSelectedCandidates] = useState<Candidate[]>([]);
  const [copied, setCopied] = useState(false);

  const toggleCandidate = useCallback((candidate: Candidate) => {
    setSelectedCandidates((prev) => {
      const exists = prev.find((c) => c.candidate_name === candidate.candidate_name);
      if (exists) {
        return prev.filter((c) => c.candidate_name !== candidate.candidate_name);
      }
      if (prev.length >= 4) {
        return prev;
      }
      return [...prev, candidate];
    });
  }, []);

  const handleShareLink = useCallback(() => {
    const ids = selectedCandidates.map(c => c.candidate_name).join(",");
    const url = `${window.location.origin}${window.location.pathname}?compare=${encodeURIComponent(ids)}`;
    navigator.clipboard.writeText(url);
  }, [selectedCandidates]);

  const handleExportCSV = useCallback(() => {
    const headers = ["姓名", "匹配分", "等级", "公司", "经验", "硬性条件", "技能匹配", "行业经验", "发展潜力", "标签", "匹配标准"];
    const rows = selectedCandidates.map(c => [
      c.candidate_name,
      c.match_score,
      c.level === "strong_recommend" ? "强烈推荐" : "可备选",
      c.current_company || "",
      c.years_experience || "",
      c.score_breakdown?.hard_conditions || "",
      c.score_breakdown?.skill_match || "",
      c.score_breakdown?.industry_exp || "",
      c.score_breakdown?.potential || "",
      (c.tags || []).join(";"),
      (c.matched_criteria || []).join(";")
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.map(v => `"${v}"`).join(","))].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `candidate-comparison-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [selectedCandidates]);

  const handleExportJSON = useCallback(() => {
    const exportData = {
      exported_at: new Date().toISOString(),
      candidates_count: selectedCandidates.length,
      criteria: criteria,
      candidates: selectedCandidates.map((c, i) => ({
        rank: i + 1,
        ...c,
        level_label: c.level === "strong_recommend" ? "强烈推荐" : "可备选"
      }))
    };
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `candidate-comparison-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [selectedCandidates, criteria]);

  const handleCopyReport = useCallback(() => {
    const report = selectedCandidates.map((c, i) => {
      const scores = [];
      if (c.score_breakdown) {
        scores.push(`硬性条件:${c.score_breakdown.hard_conditions || 0}%`);
        scores.push(`技能匹配:${c.score_breakdown.skill_match || 0}%`);
        scores.push(`行业经验:${c.score_breakdown.industry_exp || 0}%`);
        scores.push(`发展潜力:${c.score_breakdown.potential || 0}%`);
      }
      return `${i + 1}. ${c.candidate_name} (${c.match_score}%) ${c.level === "strong_recommend" ? "强烈推荐" : "可备选"}\n   公司:${c.current_company || "-"} | 经验:${c.years_experience ? `${c.years_experience}年` : "-"}\n   评分:${scores.join(" | ") || "无详细评分"}`;
    }).join("\n\n");
    const fullReport = `【候选人对比报告】\n生成时间:${new Date().toLocaleString()}\n\n${report}`;
    navigator.clipboard.writeText(fullReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [selectedCandidates]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-red-400";
  };

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
        className="bg-[#1F2937] rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">候选人对比</h2>
            <p className="text-cyan-100 text-sm mt-1">
              选择2-4位候选人进行横向对比
            </p>
          </div>
          <div className="flex items-center gap-3">
            {selectedCandidates.length >= 2 && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopyReport}
                  className={`px-3 py-1.5 text-white text-sm rounded-lg transition-colors flex items-center gap-1 ${
                    copied ? "bg-emerald-500/40" : "bg-cyan-500/40 hover:bg-cyan-500/50"
                  }`}
                >
                  {copied ? "✅ 已复制" : "📄 复制报告"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShareLink}
                  className="px-3 py-1.5 bg-white/20 text-white text-sm rounded-lg hover:bg-white/30 transition-colors flex items-center gap-1"
                >
                  🔗 分享链接
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 bg-amber-500/40 text-white text-sm rounded-lg hover:bg-amber-500/50 transition-colors flex items-center gap-1"
                >
                  📊 CSV
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleExportJSON}
                  className="px-3 py-1.5 bg-emerald-500/40 text-white text-sm rounded-lg hover:bg-emerald-500/50 transition-colors flex items-center gap-1"
                >
                  📋 JSON
                </motion.button>
              </>
            )}
            <motion.button
              whileHover={{ scale: 1.2, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="text-cyan-100 hover:text-white transition-colors"
            >
              ✕
            </motion.button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Candidate Selection */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                选择候选人 (已选 {selectedCandidates.length}/4)
              </h3>
              {selectedCandidates.length >= 4 && (
                <span className="text-xs text-amber-400 bg-amber-500/20 px-2 py-1 rounded-full">
                  已达最大选择数量
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {candidates.map((candidate, index) => (
                <CandidateCard
                  key={candidate.candidate_name}
                  candidate={candidate}
                  isSelected={selectedCandidates.some(
                    (c) => c.candidate_name === candidate.candidate_name
                  )}
                  onClick={() => toggleCandidate(candidate)}
                  rank={index + 1}
                />
              ))}
            </div>
          </div>

          {/* Comparison Table */}
          <AnimatePresence>
            {selectedCandidates.length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-[#111827] rounded-xl border border-gray-700 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-3">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <span>📊</span> 对比分析表 ({selectedCandidates.length}人)
                  </h3>
                </div>
                <ComparisonTable candidates={selectedCandidates} criteria={criteria} />

                {/* Score visualization */}
                <div className="p-6 border-t border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    分数对比
                  </h4>
                  <div className="space-y-4">
                    {selectedCandidates.map((c) => (
                      <motion.div
                        key={c.candidate_name}
                        whileHover={{ scale: 1.01 }}
                        className="flex items-center gap-4"
                      >
                        <span className="w-24 text-sm text-gray-300 truncate">
                          {c.candidate_name}
                        </span>
                        <div className="flex-1 bg-gray-700 rounded-full h-4 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${c.match_score}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            whileHover={{ boxShadow: "0 0 10px rgba(34, 211, 238, 0.5)" }}
                            className={`h-full rounded-full shadow-lg ${
                              c.match_score >= 80
                                ? "bg-emerald-500 shadow-emerald-500/30"
                                : c.match_score >= 60
                                ? "bg-amber-500 shadow-amber-500/30"
                                : "bg-red-500 shadow-red-500/30"
                            }`}
                          />
                        </div>
                        <span className={`w-12 text-right text-sm font-bold ${getScoreColor(c.match_score)}`}>
                          {c.match_score}%
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {selectedCandidates.length < 2 && (
            <div className="text-center py-12 text-gray-400">
              <span className="text-4xl mb-4 block">👆</span>
              <p>请选择至少2位候选人进行对比</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
