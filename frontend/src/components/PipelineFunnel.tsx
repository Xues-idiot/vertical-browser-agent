"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";

/* ============================================
   PIPELINEFUNNEL COMPONENT
   ============================================

   Design System Applied:
   - Card: Dark elevated surface
   - Colors: Cyan, Amber, Emerald, Purple
   - Motion: Scale on hover, staggered animations
   ============================================ */

interface Candidate {
  candidate_name: string;
  match_score: number;
  level: string;
  status?: "pending" | "interview" | "offer" | "hired" | "rejected";
  source?: string;
  years_experience?: number;
}

interface PipelineFunnelProps {
  candidates: Candidate[];
  totalResumes: number;
}

interface FunnelStage {
  key: string;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}

const stages: FunnelStage[] = [
  { key: "total", label: "收到简历", icon: "📥", color: "text-[#94a3b8]", bgColor: "bg-[#64748b]" },
  { key: "screened", label: "通过筛选", icon: "✅", color: "text-[#22d3ee]", bgColor: "bg-[#0891b2]" },
  { key: "interview", label: "进入面试", icon: "👥", color: "text-[#fbbf24]", bgColor: "bg-[#f59e0b]" },
  { key: "offer", label: "发放Offer", icon: "📋", color: "text-[#34d399]", bgColor: "bg-[#10b981]" },
  { key: "hired", label: "成功入职", icon: "🎉", color: "text-[#a78bfa]", bgColor: "bg-[#7c3aed]" },
];

function getStatusCounts(candidates: Candidate[], total: number) {
  const counts = {
    total: total,
    screened: 0,
    interview: 0,
    offer: 0,
    hired: 0,
  };

  candidates.forEach((c) => {
    if (c.status === "interview" || c.status === "offer" || c.status === "hired") {
      counts.interview++;
    }
    if (c.status === "offer" || c.status === "hired") {
      counts.offer++;
    }
    if (c.status === "hired") {
      counts.hired++;
    }
    if (c.level === "strong_recommend") {
      counts.screened++;
    } else if (c.level === "backup") {
      counts.screened++;
    }
  });

  if (counts.screened === 0) {
    counts.screened = candidates.length;
  }

  return counts;
}

export default function PipelineFunnel({ candidates, totalResumes }: PipelineFunnelProps) {
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [allExpanded, setAllExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [updateTime, setUpdateTime] = useState<string>("");
  const counts = useMemo(() => getStatusCounts(candidates, totalResumes), [candidates, totalResumes]);

  // Update time when candidates change
  useMemo(() => {
    setUpdateTime(new Date().toLocaleTimeString());
  }, [candidates.length]);

  const toggleAllStages = () => {
    if (allExpanded) {
      setExpandedStage(null);
    } else {
      setExpandedStage("screened");
    }
    setAllExpanded(!allExpanded);
  };

  const maxCount = Math.max(...Object.values(counts), 1);

  const stageCandidatesMap = useMemo(() => {
    const map: Record<string, typeof candidates> = {};
    stages.forEach((stage) => {
      map[stage.key] = candidates.filter(c => {
        if (stage.key === "total") return true;
        if (stage.key === "screened") return c.level === "strong_recommend" || c.level === "backup";
        if (stage.key === "interview") return c.status === "interview" || c.status === "offer" || c.status === "hired";
        if (stage.key === "offer") return c.status === "offer" || c.status === "hired";
        if (stage.key === "hired") return c.status === "hired";
        return false;
      });
    });
    return map;
  }, [candidates]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1f2937] rounded-2xl shadow-xl border border-[#334155] overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#334155] to-[#1f2937] px-6 py-5 flex justify-between items-center border-b border-[#334155]">
        <div>
          <motion.h3
            whileHover={{ scale: 1.02 }}
            className="text-lg font-display font-semibold text-[#f8fafc] flex items-center gap-2 cursor-default"
          >
            <span>🔍</span> 招聘漏斗
          </motion.h3>
          <motion.p
            whileHover={{ scale: 1.02 }}
            className="text-[#94a3b8] text-sm mt-1 cursor-default"
          >
            候选人状态流转追踪
          </motion.p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleAllStages}
          className="text-xs text-[#94a3b8] hover:text-white bg-[#0a0f1a]/50 hover:bg-[#0a0f1a] px-4 py-2 rounded-xl transition-all border border-[#334155]"
        >
          {allExpanded ? "收起全部" : "展开全部"}
        </motion.button>
      </div>

      <div className="p-6 space-y-6">
        {/* Funnel Visualization */}
        <div className="relative">
          <div className="space-y-4">
            {stages.map((stage, index) => {
              const count = counts[stage.key as keyof typeof counts];
              const percentage = (count / maxCount) * 100;
              const isLast = index === stages.length - 1;
              const isExpanded = expandedStage === stage.key;
              const stageCandidates = stageCandidatesMap[stage.key] || [];

              return (
                <motion.div
                  key={stage.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div
                    className={`flex items-center gap-4 cursor-pointer transition-all rounded-xl ${isExpanded ? "bg-[#0a0f1a] p-4 -mx-4" : ""}`}
                    onClick={() => setExpandedStage(isExpanded ? null : stage.key)}
                  >
                    {/* Stage label */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="w-28 flex items-center gap-2 cursor-default"
                    >
                      <span className="text-lg">{stage.icon}</span>
                      <span className="text-sm text-[#94a3b8]">{stage.label}</span>
                    </motion.div>

                    {/* Bar */}
                    <div className="flex-1 h-11 bg-[#0a0f1a] rounded-xl overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(percentage, 8)}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 + 0.2, ease: "easeOut" }}
                        className={`h-full ${stage.bgColor} rounded-xl flex items-center justify-end pr-4 shadow-lg`}
                        style={{ minWidth: "48px" }}
                      >
                        <span className="text-white font-bold text-sm">
                          {count}
                        </span>
                      </motion.div>

                      {/* Connector */}
                      {!isLast && (
                        <div className="absolute -bottom-3 left-0 w-full flex justify-center">
                          <motion.div
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ delay: index * 0.1 + 0.5 }}
                            className="w-0.5 h-4 bg-[#334155]"
                          />
                        </div>
                      )}
                    </div>

                    {/* Percentage */}
                    <div className="w-18 text-right flex items-center gap-2">
                      <motion.span
                        whileHover={{ scale: 1.1 }}
                        className={`text-sm font-medium ${stage.color} cursor-default`}
                      >
                        {totalResumes > 0 ? Math.round((count / totalResumes) * 100) : 0}%
                      </motion.span>
                      {stageCandidates.length > 0 && (
                        <motion.span
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          className="text-xs text-[#64748b]"
                        >
                          ▼
                        </motion.span>
                      )}
                    </div>
                  </div>

                  {/* Expanded candidate list */}
                  <AnimatePresence>
                    {isExpanded && stageCandidates.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3 ml-32 space-y-2 overflow-hidden"
                      >
                        {stageCandidates.slice(0, 5).map((c) => (
                          <motion.div
                            key={c.candidate_name}
                            whileHover={{ scale: 1.02, backgroundColor: "rgba(51, 65, 85, 0.5)" }}
                            className="flex items-center gap-3 bg-[#0a0f1a] rounded-xl px-4 py-3 cursor-default border border-[#334155]/50"
                          >
                            <span className={`w-2 h-2 rounded-full ${c.level === "strong_recommend" ? "bg-[#10b981]" : "bg-[#f59e0b]"}`} />
                            <span className="text-sm text-[#f8fafc] flex-1 truncate">{c.candidate_name}</span>
                            <span className="text-xs text-[#64748b]">{c.years_experience ? `${c.years_experience}年` : "-"}</span>
                            <span className="text-sm font-medium text-[#22d3ee]">{c.match_score}%</span>
                          </motion.div>
                        ))}
                        {stageCandidates.length > 5 && (
                          <div className="text-xs text-[#64748b] text-center py-2">
                            还有 {stageCandidates.length - 5} 位候选人...
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Conversion rates */}
        <div className="pt-6 border-t border-[#334155]">
          <motion.h4
            whileHover={{ scale: 1.02 }}
            className="text-sm font-display font-semibold text-[#94a3b8] uppercase tracking-wider mb-4 cursor-default"
          >
            转化率分析
          </motion.h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-[#0a0f1a] rounded-xl p-4 text-center border border-[#334155] hover:border-[#0891b2]/50 transition-all cursor-default"
            >
              <div className="text-2xl font-bold text-[#22d3ee]">
                {totalResumes > 0 ? Math.round((counts.screened / totalResumes) * 100) : 0}%
              </div>
              <div className="text-xs text-[#64748b] mt-2">简历→筛选</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-[#0a0f1a] rounded-xl p-4 text-center border border-[#334155] hover:border-[#f59e0b]/50 transition-all cursor-default"
            >
              <div className="text-2xl font-bold text-[#fbbf24]">
                {counts.screened > 0 ? Math.round((counts.interview / counts.screened) * 100) : 0}%
              </div>
              <div className="text-xs text-[#64748b] mt-2">筛选→面试</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-[#0a0f1a] rounded-xl p-4 text-center border border-[#334155] hover:border-[#10b981]/50 transition-all cursor-default"
            >
              <div className="text-2xl font-bold text-[#34d399]">
                {counts.interview > 0 ? Math.round((counts.offer / counts.interview) * 100) : 0}%
              </div>
              <div className="text-xs text-[#64748b] mt-2">面试→Offer</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-[#0a0f1a] rounded-xl p-4 text-center border border-[#334155] hover:border-[#a78bfa]/50 transition-all cursor-default"
            >
              <div className="text-2xl font-bold text-[#a78bfa]">
                {counts.offer > 0 ? Math.round((counts.hired / counts.offer) * 100) : 0}%
              </div>
              <div className="text-xs text-[#64748b] mt-2">Offer→入职</div>
            </motion.div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="text-[#94a3b8] cursor-default"
            >
              共 <span className="text-[#f8fafc] font-medium">{candidates.length}</span> 位候选人
            </motion.span>
            <span className="text-[#334155]">|</span>
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="text-[#34d399] cursor-default"
            >
              强烈推荐 <span className="font-medium">{candidates.filter(c => c.level === "strong_recommend").length}</span>
            </motion.span>
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="text-[#fbbf24] cursor-default"
            >
              可备选 <span className="font-medium">{candidates.filter(c => c.level === "backup").length}</span>
            </motion.span>
          </div>
          <motion.span
            whileHover={{ scale: 1.05 }}
            className="text-[#64748b] cursor-default"
          >
            漏斗更新时间: {updateTime}
          </motion.span>
        </div>

        {/* Source Stats */}
        <div className="pt-6 border-t border-[#334155]">
          <div className="flex items-center justify-between mb-4">
            <motion.h4
              whileHover={{ scale: 1.02 }}
              className="text-sm font-display font-semibold text-[#94a3b8] uppercase tracking-wider cursor-default"
            >
              来源渠道分析
            </motion.h4>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                const sourceLabels: Record<string, string> = {
                  referral: "内推",
                  headhunter: "猎头",
                  website: "网站",
                  resume_db: "简历库",
                  other: "其他"
                };
                const summary = Object.entries(sourceLabels)
                  .map(([key, label]) => `${label}: ${candidates.filter(c => c.source === key).length}`)
                  .filter(s => !s.endsWith(": 0"))
                  .join(", ");
                navigator.clipboard.writeText(summary || "无来源数据");
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className={`text-xs transition-colors flex items-center gap-1 ${
                copied ? "text-[#10b981]" : "text-[#94a3b8] hover:text-[#22d3ee]"
              }`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {copied ? "已复制" : "复制"}
            </motion.button>
          </div>
          <div className="flex flex-wrap gap-2">
            {["referral", "headhunter", "website", "resume_db", "other"].map((src) => {
              const count = candidates.filter(c => c.source === src).length;
              if (count === 0) return null;
              return (
                <motion.span
                  key={src}
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(10, 15, 26, 0.8)" }}
                  className="px-3 py-2 bg-[#0a0f1a] rounded-xl text-xs flex items-center gap-2 cursor-default border border-[#334155] hover:border-[#0891b2]/50 transition-all"
                >
                  <span className="w-2 h-2 bg-[#0891b2] rounded-full" />
                  <span className="text-[#94a3b8]">
                    {src === "referral" && "👥 内推"}
                    {src === "headhunter" && "🎯 猎头"}
                    {src === "website" && "🌐 网站"}
                    {src === "resume_db" && "📁 简历库"}
                    {src === "other" && "📋 其他"}
                  </span>
                  <span className="text-[#22d3ee] font-medium">{count}</span>
                </motion.span>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
