"use client";

import { motion } from "framer-motion";

interface RecruitmentDashboardProps {
  totalResumes: number;
  screenedResumes: number;
  candidates: Array<{
    match_score: number;
    level: string;
    status?: string;
  }>;
}

export default function RecruitmentDashboard({
  totalResumes,
  screenedResumes,
  candidates,
}: RecruitmentDashboardProps) {
  const strongRecommend = candidates.filter(c => c.level === "strong_recommend").length;
  const backup = candidates.filter(c => c.level === "backup").length;
  const avgScore = candidates.length > 0
    ? Math.round(candidates.reduce((sum, c) => sum + c.match_score, 0) / candidates.length)
    : 0;

  const inInterview = candidates.filter(c => c.status === "interview").length;
  const withOffer = candidates.filter(c => c.status === "offer").length;

  const stats = [
    {
      label: "收到简历",
      value: totalResumes,
      icon: "📥",
      color: "from-gray-500 to-gray-600",
      bgColor: "bg-gray-500",
    },
    {
      label: "通过筛选",
      value: screenedResumes,
      icon: "✅",
      color: "from-cyan-500 to-cyan-600",
      bgColor: "bg-cyan-500",
      sub: `${totalResumes > 0 ? Math.round((screenedResumes / totalResumes) * 100) : 0}%`
    },
    {
      label: "强烈推荐",
      value: strongRecommend,
      icon: "⭐",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-500",
    },
    {
      label: "可备选",
      value: backup,
      icon: "🟡",
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-500",
    },
    {
      label: "平均匹配分",
      value: `${avgScore}%`,
      icon: "📊",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-500",
    },
    {
      label: "面试中",
      value: inInterview,
      icon: "👥",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-500",
    },
    {
      label: "待发Offer",
      value: withOffer,
      icon: "📋",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-500",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1F2937] rounded-xl shadow-lg border border-gray-700 overflow-hidden"
    >
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>📈</span> 招聘数据概览
        </h3>
        <p className="text-indigo-100 text-sm mt-1">实时统计本次筛选结果</p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bg-[#111827] rounded-xl p-4 border border-gray-700"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{stat.icon}</span>
                <span className="text-sm text-gray-400">{stat.label}</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-white">{stat.value}</span>
                {stat.sub && (
                  <span className="text-sm text-gray-500 mb-1">{stat.sub}</span>
                )}
              </div>
              <div className="mt-3 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${typeof stat.value === 'number' && totalResumes > 0 ? Math.min((stat.value / totalResumes) * 100, 100) : 50}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className={`h-full ${stat.bgColor} rounded-full`}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Score Distribution */}
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            评分分布
          </h4>
          <div className="flex items-end gap-2 h-24">
            {[
              { label: "90+", count: candidates.filter(c => c.match_score >= 90).length, color: "bg-emerald-500" },
              { label: "80-89", count: candidates.filter(c => c.match_score >= 80 && c.match_score < 90).length, color: "bg-emerald-400" },
              { label: "70-79", count: candidates.filter(c => c.match_score >= 70 && c.match_score < 80).length, color: "bg-amber-500" },
              { label: "60-69", count: candidates.filter(c => c.match_score >= 60 && c.match_score < 70).length, color: "bg-amber-400" },
              { label: "<60", count: candidates.filter(c => c.match_score < 60).length, color: "bg-red-500" },
            ].map((bucket, i) => (
              <div key={bucket.label} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max((bucket.count / Math.max(candidates.length, 1)) * 100, 4)}%` }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.05 }}
                  className={`w-full ${bucket.color} rounded-t-sm min-h-[4px]`}
                />
                <span className="text-xs text-gray-500">{bucket.count}</span>
                <span className="text-xs text-gray-600">{bucket.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
