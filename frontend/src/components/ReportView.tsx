"use client";

import { motion } from "framer-motion";
import { useState } from "react";

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
      className="bg-[#1F2937] rounded-xl shadow-lg border border-gray-700 overflow-hidden"
    >
      <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>📋</span> 筛选报告
        </h2>
      </div>

      <div className="p-6">
        {/* 基本信息 */}
        <div className="space-y-3 mb-6">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-between items-center p-3 bg-[#111827] rounded-lg border border-gray-700 shadow-sm"
          >
            <span className="text-gray-400">岗位</span>
            <span className="font-semibold text-white">
              {report.position_name}
            </span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="flex justify-between items-center p-3 bg-[#111827] rounded-lg border border-gray-700 shadow-sm"
          >
            <span className="text-gray-400">收到简历</span>
            <span className="font-semibold text-white">
              {report.total_resumes}份
            </span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-between items-center p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30 shadow-sm shadow-emerald-500/10"
          >
            <span className="text-emerald-400">筛选通过</span>
            <span className="font-bold text-emerald-400 text-lg">
              {report.screened_resumes}份
            </span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg border border-red-500/30 shadow-sm shadow-red-500/10"
          >
            <span className="text-red-400">淘汰</span>
            <span className="font-bold text-red-400 text-lg">
              {report.total_resumes - report.screened_resumes}份
            </span>
          </motion.div>
        </div>

        {/* 通过率 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 rounded-xl p-5 mb-6 border border-cyan-500/20"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-cyan-400 font-medium">简历通过率</span>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="text-3xl font-bold text-cyan-400"
            >
              {passRate}%
            </motion.span>
          </div>
          <div className="bg-[#111827] rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${passRate}%` }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              className="bg-gradient-to-r from-cyan-500 to-cyan-600 h-3 rounded-full shadow-lg shadow-cyan-500/30"
            />
          </div>
        </motion.div>

        {/* 生成时间 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-gray-500"
        >
          生成时间: {report.generated_at}
        </motion.div>

        {/* 复制报告 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-4 pt-4 border-t border-gray-700"
        >
          <button
            onClick={handleCopyReport}
            className={`w-full py-2 px-3 bg-[#111827] border rounded-lg text-sm flex items-center justify-center gap-2 transition-colors ${
              copied
                ? "border-emerald-500/50 text-emerald-400"
                : "border-gray-700 text-gray-400 hover:text-cyan-400 hover:border-cyan-500/50"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {copied ? "已复制!" : "复制报告摘要"}
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}