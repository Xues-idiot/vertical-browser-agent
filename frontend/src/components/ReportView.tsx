"use client";

import { motion } from "framer-motion";
import { useState } from "react";

/* ============================================
   REPORTVIEW COMPONENT
   ============================================

   Design System Applied:
   - Card: Cyan gradient header
   - Primary Color: Cyan (#0891B2)
   - Semantic Colors: Emerald (success), Red (error)
   - Motion: Scale on hover, staggered animations
   ============================================ */

interface Report {
  position_name: string;
  jd_source: string;
  total_resumes: number;
  screened_resumes: number;
  generated_at: string;
}

interface ReportViewProps {
  report: Report;
  markdown?: string;
}

export default function ReportView({ report, markdown }: ReportViewProps) {
  const [copied, setCopied] = useState(false);
  const passRate = report.total_resumes > 0
    ? Math.round((report.screened_resumes / report.total_resumes) * 100)
    : 0;

  const handleCopyReport = () => {
    const summary = `【筛选报告】
岗位: ${report.position_name}
收到简历: ${report.total_resumes}份
筛选通过: ${report.screened_resumes}份
通过率: ${passRate}%
生成时间: ${report.generated_at}`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#1f2937] rounded-2xl shadow-xl border border-[#334155] overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0891b2] to-[#0e7490] px-6 py-5">
        <motion.h2
          whileHover={{ scale: 1.02 }}
          className="text-xl font-display font-bold text-white flex items-center gap-2"
        >
          <span>📋</span> 筛选报告
        </motion.h2>
      </div>

      <div className="p-6 space-y-4">
        {/* Position Info */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.01, borderColor: "rgba(34, 211, 238, 0.4)" }}
          className="flex justify-between items-center p-4 bg-[#0a0f1a] rounded-xl border border-[#334155] cursor-default"
        >
          <span className="text-[#94a3b8]">岗位</span>
          <span className="font-semibold text-[#f8fafc]">
            {report.position_name}
          </span>
        </motion.div>

        {/* Total Resumes */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          whileHover={{ scale: 1.01, borderColor: "rgba(34, 211, 238, 0.4)" }}
          className="flex justify-between items-center p-4 bg-[#0a0f1a] rounded-xl border border-[#334155] cursor-default"
        >
          <span className="text-[#94a3b8]">收到简历</span>
          <span className="font-semibold text-[#f8fafc]">
            {report.total_resumes}份
          </span>
        </motion.div>

        {/* Screened */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.01, borderColor: "rgba(52, 211, 153, 0.4)" }}
          className="flex justify-between items-center p-4 bg-[#10b981]/10 rounded-xl border border-[#10b981]/30 cursor-default shadow-lg shadow-[#10b981]/5"
        >
          <span className="text-[#34d399]">筛选通过</span>
          <span className="font-bold text-[#34d399] text-lg">
            {report.screened_resumes}份
          </span>
        </motion.div>

        {/* Rejected */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          whileHover={{ scale: 1.01, borderColor: "rgba(248, 113, 113, 0.4)" }}
          className="flex justify-between items-center p-4 bg-[#ef4444]/10 rounded-xl border border-[#ef4444]/30 cursor-default shadow-lg shadow-[#ef4444]/5"
        >
          <span className="text-[#f87171]">淘汰</span>
          <span className="font-bold text-[#f87171] text-lg">
            {report.total_resumes - report.screened_resumes}份
          </span>
        </motion.div>

        {/* Pass Rate */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          className="bg-gradient-to-br from-[#0891b2]/10 to-[#0891b2]/5 rounded-2xl p-5 border border-[#0891b2]/20 shadow-lg"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-[#22d3ee] font-medium">简历通过率</span>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="text-3xl font-bold text-[#22d3ee]"
            >
              {passRate}%
            </motion.span>
          </div>
          <div className="bg-[#0a0f1a] rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${passRate}%` }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              className="bg-gradient-to-r from-[#0891b2] to-[#22d3ee] h-3 rounded-full shadow-lg shadow-[#0891b2]/30"
            />
          </div>
        </motion.div>

        {/* Generation Time */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          className="text-center text-sm text-[#64748b] cursor-default pt-2"
        >
          生成时间: {report.generated_at}
        </motion.div>

        {/* Copy Report Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="pt-4 border-t border-[#334155]"
        >
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 4px 20px rgba(6, 182, 212, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCopyReport}
            className={`w-full py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all ${
              copied
                ? "bg-[#10b981]/20 border border-[#10b981]/50 text-[#34d399]"
                : "bg-[#0a0f1a] border border-[#334155] text-[#94a3b8] hover:text-[#22d3ee] hover:border-[#0891b2]/50"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {copied ? "已复制!" : "复制报告摘要"}
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}
