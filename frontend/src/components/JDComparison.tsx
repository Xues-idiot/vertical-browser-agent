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
}

interface JDComparisonProps {
  candidates: Candidate[];
  criteria: string[];
  onClose: () => void;
}

interface JDItem {
  id: string;
  name: string;
  criteria: string[];
}

function JDComparisonTable({
  candidates,
  jds,
}: {
  candidates: Candidate[];
  jds: JDItem[];
}) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  // Simulate different scores for different JDs
  const getScoreForJD = (candidate: Candidate, jdIndex: number) => {
    const base = candidate.match_score;
    const variance = (jdIndex * 7) % 20 - 10; // -10 to +10 variance
    return Math.max(50, Math.min(98, base + variance));
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400 sticky left-0 bg-[#1F2937] z-10">
              候选人
            </th>
            {jds.map((jd) => (
              <th
                key={jd.id}
                className="text-left py-3 px-4 text-sm font-semibold text-white min-w-[120px]"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-500 rounded-full" />
                  {jd.name}
                </div>
                <p className="text-xs text-gray-400 font-normal mt-1">
                  {jd.criteria.slice(0, 2).join(", ")}
                  {jd.criteria.length > 2 && "..."}
                </p>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate, cIndex) => (
            <tr key={cIndex} className="border-b border-gray-700/50">
              <td className="py-4 px-4 sticky left-0 bg-[#111827] z-10">
                <div className="font-medium text-white">{candidate.candidate_name}</div>
                <div className="text-xs text-gray-400">
                  {candidate.current_company || "未知公司"}
                </div>
              </td>
              {jds.map((jd, jdIndex) => {
                const score = getScoreForJD(candidate, jdIndex);
                return (
                  <td key={jd.id} className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-700 rounded-full h-2 max-w-[100px] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${score}%` }}
                          transition={{ duration: 0.5, delay: cIndex * 0.1 + jdIndex * 0.05 }}
                          className={`h-full ${getScoreBg(score)} rounded-full`}
                        />
                      </div>
                      <span className={`text-sm font-bold ${getScoreColor(score)} w-10`}>
                        {score}%
                      </span>
                    </div>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {candidate.score_breakdown && (
                        <>
                          {candidate.score_breakdown.hard_conditions !== undefined && (
                            <span className="text-xs text-gray-500">
                              硬{candidate.score_breakdown.hard_conditions}
                            </span>
                          )}
                          {candidate.score_breakdown.skill_match !== undefined && (
                            <span className="text-xs text-gray-500">
                              技{candidate.score_breakdown.skill_match}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function JDComparison({
  candidates,
  criteria,
  onClose,
}: JDComparisonProps) {
  const [jds, setJDs] = useState<JDItem[]>([
    {
      id: "jd1",
      name: "高级产品经理",
      criteria: criteria,
    },
    {
      id: "jd2",
      name: "产品总监",
      criteria: ["8年+经验", "管理团队", "上市公司背景", "本科985"],
    },
  ]);
  const [newJDName, setNewJDName] = useState("");

  const getScoreColor = useCallback((score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-red-400";
  }, []);

  const addJD = useCallback(() => {
    if (!newJDName.trim()) return;
    setJDs((prev) => [
      ...prev,
      {
        id: `jd${Date.now()}`,
        name: newJDName.trim(),
        criteria: ["经验3年+", "相关行业"],
      },
    ]);
    setNewJDName("");
  }, [newJDName]);

  const removeJD = useCallback((id: string) => {
    if (jds.length <= 1) return;
    setJDs((prev) => prev.filter((jd) => jd.id !== id));
  }, [jds.length]);

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
        className="bg-[#1F2937] rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">JD对比分析</h2>
              <p className="text-purple-100 text-sm mt-1">
                对比候选人在不同职位下的适配度
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-purple-100 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* JD List Management */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              职位列表 ({jds.length}/5)
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {jds.map((jd) => (
                <div
                  key={jd.id}
                  className="flex items-center gap-2 bg-[#111827] border border-gray-700 rounded-lg px-3 py-2"
                >
                  <span className="w-2 h-2 bg-cyan-500 rounded-full" />
                  <span className="text-sm text-white">{jd.name}</span>
                  {jds.length > 1 && (
                    <button
                      onClick={() => removeJD(jd.id)}
                      className="text-gray-500 hover:text-red-400 transition-colors ml-1"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            {jds.length < 5 && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newJDName}
                  onChange={(e) => setNewJDName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addJD()}
                  placeholder="输入新职位名称..."
                  className="flex-1 bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={addJD}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-sm"
                >
                  添加JD
                </button>
              </div>
            )}
          </div>

          {/* Comparison Table */}
          <div className="bg-[#111827] rounded-xl border border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <span>📊</span> 适配度对比表
              </h3>
            </div>
            <JDComparisonTable candidates={candidates} jds={jds} />
          </div>

          {/* Summary */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {candidates.slice(0, 3).map((c, i) => (
              <div key={i} className="bg-[#111827] rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="font-medium text-white">{c.candidate_name}</span>
                </div>
                <div className="text-xs text-gray-400">
                  最高适配:{" "}
                  <span className={getScoreColor(c.match_score)}>
                    {c.match_score}%
                  </span>{" "}
                  ({jds[0]?.name})
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
