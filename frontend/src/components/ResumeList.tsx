"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ResumeListProps {
  onSubmit: (resumes: string[]) => void;
  loading?: boolean;
}

export default function ResumeList({ onSubmit, loading }: ResumeListProps) {
  const [resumes, setResumes] = useState<string[]>([""]);
  const [candidateNames, setCandidateNames] = useState<string[]>([""]);

  const addResume = () => {
    setResumes([...resumes, ""]);
    setCandidateNames([...candidateNames, ""]);
  };

  const removeResume = (index: number) => {
    if (resumes.length > 1) {
      const newResumes = resumes.filter((_, i) => i !== index);
      const newNames = candidateNames.filter((_, i) => i !== index);
      setResumes(newResumes);
      setCandidateNames(newNames);
    }
  };

  const updateResume = (index: number, value: string) => {
    const newResumes = [...resumes];
    newResumes[index] = value;
    setResumes(newResumes);
  };

  const updateName = (index: number, value: string) => {
    const newNames = [...candidateNames];
    newNames[index] = value;
    setCandidateNames(newNames);
  };

  const handleSubmit = () => {
    const validResumes = resumes.filter((r) => r.trim());
    if (validResumes.length > 0) {
      onSubmit(validResumes);
    }
  };

  const validCount = resumes.filter((r) => r.trim()).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-[#1F2937] rounded-xl shadow-lg p-6 border border-gray-700"
    >
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          whileHover={{ scale: 1.1, rotate: -5 }}
          className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center text-xl border border-emerald-500/30"
        >
          📄
        </motion.div>
        <div>
          <h2 className="text-lg font-semibold text-white">
            输入简历
          </h2>
          <p className="text-sm text-gray-400">粘贴候选人简历内容</p>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {resumes.map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="border border-gray-600 rounded-lg p-4 bg-[#111827]"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-300">
                  简历 {index + 1}
                </span>
                {resumes.length > 1 && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeResume(index)}
                    className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1 transition-colors"
                  >
                    <span>×</span> 删除
                  </motion.button>
                )}
              </div>
              <input
                type="text"
                value={candidateNames[index]}
                onChange={(e) => updateName(index, e.target.value)}
                placeholder="候选人姓名（可选）"
                className="w-full px-3 py-2 border border-gray-600 rounded mb-2 focus:ring-2 focus:ring-emerald-500 outline-none bg-[#1F2937] text-white placeholder-gray-500 transition"
              />
              <textarea
                value={resumes[index]}
                onChange={(e) => updateResume(index, e.target.value)}
                placeholder="粘贴简历内容..."
                rows={5}
                className="w-full px-3 py-2 border border-gray-600 rounded focus:ring-2 focus:ring-emerald-500 outline-none resize-none bg-[#1F2937] text-white placeholder-gray-500 transition"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex gap-3 mt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={addResume}
          className="flex-1 bg-[#374151] text-gray-200 py-3 px-4 rounded-lg hover:bg-gray-600 transition flex items-center justify-center gap-2 border border-gray-600"
        >
          <span>+</span> 添加简历
        </motion.button>
        <motion.button
          whileHover={{ scale: loading || validCount === 0 ? 1 : 1.02 }}
          whileTap={{ scale: loading || validCount === 0 ? 1 : 0.98 }}
          onClick={handleSubmit}
          disabled={loading || validCount === 0}
          className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 px-4 rounded-lg disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition font-medium shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
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
              筛选中...
            </motion.span>
          ) : (
            <span>开始筛选 ({validCount}份)</span>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}