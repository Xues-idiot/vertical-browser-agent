"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface Interview {
  round: number;
  date: string;
  feedback: string;
  rating: number;
}

interface Candidate {
  candidate_name: string;
  match_score: number;
  level: string;
  interviews?: Interview[];
}

interface InterviewScheduleProps {
  candidates: Candidate[];
}

export default function InterviewSchedule({ candidates }: InterviewScheduleProps) {
  const [viewMode, setViewMode] = useState<"upcoming" | "past">("upcoming");

  // 提取所有面试安排
  const allInterviews = candidates.flatMap((c) =>
    (c.interviews || []).map((i) => ({
      ...i,
      candidateName: c.candidate_name,
      matchScore: c.match_score,
      level: c.level,
    }))
  );

  const now = new Date();
  const upcomingInterviews = allInterviews
    .filter((i) => new Date(i.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastInterviews = allInterviews
    .filter((i) => new Date(i.date) < now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const displayedInterviews = viewMode === "upcoming" ? upcomingInterviews : pastInterviews;

  // 按日期分组
  const groupedByDate: Record<string, typeof displayedInterviews> = {};
  displayedInterviews.forEach((i) => {
    const dateKey = new Date(i.date).toLocaleDateString("zh-CN", {
      month: "long",
      day: "numeric",
      weekday: "long",
    });
    if (!groupedByDate[dateKey]) {
      groupedByDate[dateKey] = [];
    }
    groupedByDate[dateKey].push(i);
  });

  const getRatingStars = (rating: number) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "strong_recommend":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "backup":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1F2937] rounded-xl shadow-lg border border-gray-700 overflow-hidden"
    >
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>📅</span> 面试安排
            </h3>
            <p className="text-indigo-100 text-sm mt-1">
              共 {allInterviews.length} 场面试
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("upcoming")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "upcoming"
                  ? "bg-white/20 text-white"
                  : "bg-white/10 text-indigo-200 hover:bg-white/20"
              }`}
            >
              即将到来 ({upcomingInterviews.length})
            </button>
            <button
              onClick={() => setViewMode("past")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "past"
                  ? "bg-white/20 text-white"
                  : "bg-white/10 text-indigo-200 hover:bg-white/20"
              }`}
            >
              已完成 ({pastInterviews.length})
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 max-h-[400px] overflow-y-auto">
        {displayedInterviews.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-3">📭</div>
            <p>{viewMode === "upcoming" ? "暂无即将到来的面试安排" : "暂无已完成的面试记录"}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedByDate).map(([date, interviews]) => (
              <div key={date}>
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {date}
                </h4>
                <div className="space-y-2">
                  {interviews.map((interview, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-[#111827] rounded-lg p-4 border border-gray-700 hover:border-indigo-500/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-white">
                              {interview.candidateName}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${getLevelBadge(interview.level)}`}>
                              {interview.level === "strong_recommend" ? "⭐强烈推荐" : "🟡可备选"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-400">
                            <span>第{interview.round}轮面试</span>
                            <span>|</span>
                            <span>{new Date(interview.date).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</span>
                            <span>|</span>
                            <span className="text-amber-400">{getRatingStars(interview.rating)}</span>
                            <span className="text-xs text-gray-500">({interview.rating}/5)</span>
                          </div>
                          {interview.feedback && (
                            <p className="text-sm text-gray-300 mt-2 line-clamp-2">
                              📝 {interview.feedback}
                            </p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-lg font-bold text-cyan-400">
                            {interview.matchScore}%
                          </div>
                          <div className="text-xs text-gray-500">匹配度</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
