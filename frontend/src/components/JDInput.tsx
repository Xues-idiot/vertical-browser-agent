"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface JDInputProps {
  onSubmit: (jdUrl: string) => void;
  loading?: boolean;
}

export default function JDInput({ onSubmit, loading }: JDInputProps) {
  const [jdUrl, setJdUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jdUrl.trim()) {
      onSubmit(jdUrl.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#1F2937] rounded-xl shadow-lg p-6 border border-gray-700"
    >
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center text-xl border border-cyan-500/30"
        >
          📋
        </motion.div>
        <div>
          <h2 className="text-lg font-semibold text-white">
            输入职位JD
          </h2>
          <p className="text-sm text-gray-400">粘贴招聘平台JD链接</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            JD链接
          </label>
          <input
            type="text"
            value={jdUrl}
            onChange={(e) => setJdUrl(e.target.value)}
            placeholder="https://www.zhipin.com/job/..."
            className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition bg-[#111827] text-white placeholder-gray-500"
            disabled={loading}
          />
        </div>
        <motion.button
          type="submit"
          disabled={loading || !jdUrl.trim()}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 text-white py-3 px-4 rounded-lg disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition font-medium shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
        >
          {loading ? (
            <motion.span
              className="flex items-center justify-center gap-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              加载中...
            </motion.span>
          ) : (
            <span className="flex items-center gap-2">
              <span>🔍</span> 获取JD
            </span>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}