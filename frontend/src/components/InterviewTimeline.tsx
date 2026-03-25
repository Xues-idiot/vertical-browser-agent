"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface TimelineEvent {
  id: string;
  candidate_name: string;
  action: "interview_scheduled" | "interview_completed" | "offer_sent" | "offer_accepted" | "rejected" | "hired";
  timestamp: string;
  note?: string;
  interviewer?: string;
}

interface InterviewTimelineProps {
  events: TimelineEvent[];
}

const actionConfig: Record<string, { label: string; icon: string; color: string; bgColor: string }> = {
  interview_scheduled: { label: "面试安排", icon: "📅", color: "text-cyan-400", bgColor: "bg-cyan-500" },
  interview_completed: { label: "面试完成", icon: "✅", color: "text-emerald-400", bgColor: "bg-emerald-500" },
  offer_sent: { label: "发送Offer", icon: "📋", color: "text-purple-400", bgColor: "bg-purple-500" },
  offer_accepted: { label: "Offer接受", icon: "🎉", color: "text-green-400", bgColor: "bg-green-500" },
  rejected: { label: "淘汰", icon: "❌", color: "text-red-400", bgColor: "bg-red-500" },
  hired: { label: "入职", icon: "🏆", color: "text-amber-400", bgColor: "bg-amber-500" },
};

export default function InterviewTimeline({ events }: InterviewTimelineProps) {
  const [filter, setFilter] = useState<string | null>(null);

  const filteredEvents = filter
    ? events.filter(e => e.action === filter)
    : events;

  const sortedEvents = [...filteredEvents].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1F2937] rounded-xl shadow-lg border border-gray-700 overflow-hidden"
    >
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>📆</span> 面试时间线
        </h3>
        <p className="text-indigo-100 text-sm mt-1">候选人状态变更记录</p>
      </div>

      <div className="p-6">
        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              !filter
                ? "bg-indigo-600 text-white"
                : "bg-[#111827] text-gray-400 border border-gray-700 hover:border-indigo-500"
            }`}
          >
            全部 ({events.length})
          </button>
          {Object.entries(actionConfig).map(([key, config]) => {
            const count = events.filter(e => e.action === key).length;
            if (count === 0) return null;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filter === key
                    ? "bg-indigo-600 text-white"
                    : "bg-[#111827] text-gray-400 border border-gray-700 hover:border-indigo-500"
                }`}
              >
                {config.icon} {config.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          {sortedEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              暂无时间线记录
            </div>
          ) : (
            sortedEvents.map((event, index) => {
              const config = actionConfig[event.action];
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex gap-4"
                >
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 ${config.bgColor} rounded-full flex items-center justify-center text-lg shadow-lg`}>
                      {config.icon}
                    </div>
                    {index < sortedEvents.length - 1 && (
                      <div className="w-0.5 flex-1 bg-gray-700 my-2" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-white">
                          {event.candidate_name}
                        </h4>
                        <p className={`text-sm ${config.color} mt-1`}>
                          {config.label}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {new Date(event.timestamp).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-600">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    {event.interviewer && (
                      <p className="text-xs text-gray-400 mt-2">
                        面试官: {event.interviewer}
                      </p>
                    )}
                    {event.note && (
                      <p className="text-sm text-gray-300 mt-2 bg-[#111827] rounded-lg px-3 py-2">
                        {event.note}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
}
