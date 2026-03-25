"use client";

import { motion } from "framer-motion";

interface Candidate {
  candidate_name: string;
  match_score: number;
  level: string;
  status?: "pending" | "interview" | "offer" | "hired" | "rejected";
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
  { key: "total", label: "收到简历", icon: "📥", color: "text-gray-400", bgColor: "bg-gray-500" },
  { key: "screened", label: "通过筛选", icon: "✅", color: "text-cyan-400", bgColor: "bg-cyan-500" },
  { key: "interview", label: "进入面试", icon: "👥", color: "text-amber-400", bgColor: "bg-amber-500" },
  { key: "offer", label: "发放Offer", icon: "📋", color: "text-emerald-400", bgColor: "bg-emerald-500" },
  { key: "hired", label: "成功入职", icon: "🎉", color: "text-purple-400", bgColor: "bg-purple-500" },
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

  // Fallback: if no status tracked, estimate from recommendations
  if (counts.screened === 0) {
    counts.screened = candidates.length;
  }

  return counts;
}

export default function PipelineFunnel({ candidates, totalResumes }: PipelineFunnelProps) {
  const counts = getStatusCounts(candidates, totalResumes);

  // Calculate percentages for funnel width
  const maxCount = Math.max(...Object.values(counts), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1F2937] rounded-xl shadow-lg border border-gray-700 overflow-hidden"
    >
      <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>🔍</span> 招聘漏斗
        </h3>
        <p className="text-gray-300 text-sm mt-1">候选人状态流转追踪</p>
      </div>

      <div className="p-6">
        {/* Funnel Visualization */}
        <div className="relative">
          {/* Funnel bars */}
          <div className="space-y-3">
            {stages.map((stage, index) => {
              const count = counts[stage.key as keyof typeof counts];
              const percentage = (count / maxCount) * 100;
              const isLast = index === stages.length - 1;

              return (
                <motion.div
                  key={stage.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="flex items-center gap-4">
                    {/* Stage label */}
                    <div className="w-24 flex items-center gap-2">
                      <span className="text-lg">{stage.icon}</span>
                      <span className="text-sm text-gray-400">{stage.label}</span>
                    </div>

                    {/* Bar */}
                    <div className="flex-1 h-10 bg-[#111827] rounded-lg overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(percentage, 8)}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 + 0.2, ease: "easeOut" }}
                        className={`h-full ${stage.bgColor} rounded-lg flex items-center justify-end pr-3`}
                        style={{ minWidth: "40px" }}
                      >
                        <span className="text-white font-bold text-sm">
                          {count}
                        </span>
                      </motion.div>

                      {/* Connector line to next stage */}
                      {!isLast && (
                        <div className="absolute -bottom-2 left-0 w-full flex justify-center">
                          <motion.div
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ delay: index * 0.1 + 0.5 }}
                            className="w-0.5 h-3 bg-gray-600"
                          />
                        </div>
                      )}
                    </div>

                    {/* Percentage */}
                    <div className="w-16 text-right">
                      <span className={`text-sm font-medium ${stage.color}`}>
                        {totalResumes > 0 ? Math.round((count / totalResumes) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Conversion rates */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            转化率分析
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#111827] rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-cyan-400">
                {totalResumes > 0 ? Math.round((counts.screened / totalResumes) * 100) : 0}%
              </div>
              <div className="text-xs text-gray-400 mt-1">简历→筛选</div>
            </div>
            <div className="bg-[#111827] rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-amber-400">
                {counts.screened > 0 ? Math.round((counts.interview / counts.screened) * 100) : 0}%
              </div>
              <div className="text-xs text-gray-400 mt-1">筛选→面试</div>
            </div>
            <div className="bg-[#111827] rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-emerald-400">
                {counts.interview > 0 ? Math.round((counts.offer / counts.interview) * 100) : 0}%
              </div>
              <div className="text-xs text-gray-400 mt-1">面试→Offer</div>
            </div>
            <div className="bg-[#111827] rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-400">
                {counts.offer > 0 ? Math.round((counts.hired / counts.offer) * 100) : 0}%
              </div>
              <div className="text-xs text-gray-400 mt-1">Offer→入职</div>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-6 flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-gray-400">
              共 <span className="text-white font-medium">{candidates.length}</span> 位候选人
            </span>
            <span className="text-gray-500">|</span>
            <span className="text-emerald-400">
              强烈推荐 <span className="font-medium">{candidates.filter(c => c.level === "strong_recommend").length}</span>
            </span>
            <span className="text-amber-400">
              可备选 <span className="font-medium">{candidates.filter(c => c.level === "backup").length}</span>
            </span>
          </div>
          <div className="text-gray-500">
            漏斗更新时间: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
