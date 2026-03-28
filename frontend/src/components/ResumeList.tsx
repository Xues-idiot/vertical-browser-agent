"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { validateResumeText } from "@/lib/validation";

interface ResumeListProps {
  onSubmit: (resumes: string[]) => void;
  loading?: boolean;
}

// Extract key info from resume text
function extractResumePreview(text: string): { name?: string; email?: string; phone?: string; education?: string; experience?: string } {
  const result: { name?: string; email?: string; phone?: string; education?: string; experience?: string } = {};

  // Extract email
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) result.email = emailMatch[0];

  // Extract phone
  const phoneMatch = text.match(/1[3-9]\d{9}/);
  if (phoneMatch) result.phone = phoneMatch[0];

  // Extract education
  const eduKeywords = ["本科", "硕士", "博士", "大专", "高中", "985", "211", "研究生"];
  for (const kw of eduKeywords) {
    if (text.includes(kw)) {
      result.education = kw;
      break;
    }
  }

  // Extract years of experience
  const expMatch = text.match(/(\d+)\s*年/);
  if (expMatch) result.experience = `${expMatch[1]}年`;

  return result;
}

export default function ResumeList({ onSubmit, loading }: ResumeListProps) {
  const [resumes, setResumes] = useState<string[]>([""]);
  const [candidateNames, setCandidateNames] = useState<string[]>([""]);
  const [errors, setErrors] = useState<(string | null)[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const addResume = useCallback(() => {
    setResumes((prev) => [...prev, ""]);
    setCandidateNames((prev) => [...prev, ""]);
    setErrors((prev) => [...prev, null]);
  }, []);

  const removeResume = useCallback((index: number) => {
    if (resumes.length > 1) {
      setResumes((prev) => prev.filter((_, i) => i !== index));
      setCandidateNames((prev) => prev.filter((_, i) => i !== index));
      setErrors((prev) => prev.filter((_, i) => i !== index));
    }
  }, [resumes.length]);

  const updateResume = useCallback((index: number, value: string) => {
    setResumes((prev) => {
      const newResumes = [...prev];
      newResumes[index] = value;
      return newResumes;
    });
    setErrors((prev) => {
      const newErrors = [...prev];
      newErrors[index] = null;
      return newErrors;
    });
  }, []);

  const updateName = useCallback((index: number, value: string) => {
    setCandidateNames((prev) => {
      const newNames = [...prev];
      newNames[index] = value;
      return newNames;
    });
  }, []);

  const handleSubmit = useCallback(() => {
    // Validate all resumes
    const newErrors: (string | null)[] = [];
    let hasError = false;

    resumes.forEach((resume, i) => {
      if (resume.trim()) {
        const validation = validateResumeText(resume);
        if (!validation.valid) {
          newErrors[i] = validation.error || "简历验证失败";
          hasError = true;
        } else {
          newErrors[i] = null;
        }
      } else {
        newErrors[i] = null;
      }
    });

    setErrors(newErrors);

    if (hasError) {
      return;
    }

    const validResumes = resumes.filter((r) => r.trim());
    if (validResumes.length > 0) {
      // 将候选人姓名嵌入简历文本中传递给后端
      const resumesWithNames = resumes.map((resume, i) => {
        const name = candidateNames[i]?.trim();
        if (name) {
          return `【候选人: ${name}】\n${resume}`;
        }
        return resume;
      }).filter((r) => r.trim());
      onSubmit(resumesWithNames);
    }
  }, [resumes, candidateNames, onSubmit]);

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
              <div className="relative">
                <textarea
                  value={resumes[index]}
                  onChange={(e) => updateResume(index, e.target.value)}
                  placeholder="粘贴简历内容..."
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-600 rounded focus:ring-2 focus:ring-emerald-500 outline-none resize-none bg-[#1F2937] text-white placeholder-gray-500 transition pr-20"
                />
                {resumes[index] && (
                  <div className="absolute top-2 right-2 flex gap-2">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        navigator.clipboard.writeText(resumes[index]);
                        setCopiedIndex(index);
                        setTimeout(() => setCopiedIndex(null), 2000);
                      }}
                      className={`text-xs transition-colors flex items-center gap-1 bg-[#1F2937]/80 px-2 py-1 rounded ${
                        copiedIndex === index ? "text-emerald-400" : "text-gray-400 hover:text-emerald-400"
                      }`}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      {copiedIndex === index ? "已复制" : "复制"}
                    </motion.button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateResume(index, "")}
                      className="text-xs text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1 bg-[#1F2937]/80 px-2 py-1 rounded"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  </div>
                )}
              </div>
              {resumes[index] && (
                <div className="flex justify-between items-center mt-1 px-1">
                  <motion.span whileHover={{ scale: 1.02 }} className="text-xs text-gray-500 cursor-default">
                    已输入 <span className={resumes[index].length >= 20 ? "text-emerald-400" : "text-amber-400"}>{resumes[index].length}</span> 字符
                    {resumes[index].length < 20 && <span className="text-amber-400">（最少20字符）</span>}
                  </motion.span>
                </div>
              )}
              {/* Resume Preview */}
              {resumes[index] && resumes[index].length > 30 && (() => {
                const preview = extractResumePreview(resumes[index]);
                return preview.name || preview.email || preview.phone || preview.education || preview.experience ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    whileHover={{ scale: 1.01 }}
                    className="mt-2 bg-[#1F2937] rounded p-2 border border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                  >
                    <motion.div whileHover={{ scale: 1.05 }} className="text-xs text-emerald-400 mb-1 cursor-default">📋 智能提取:</motion.div>
                    <div className="flex flex-wrap gap-2">
                      {preview.name && <motion.span whileHover={{ scale: 1.05 }} className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded cursor-default">姓名: {preview.name}</motion.span>}
                      {preview.email && <motion.span whileHover={{ scale: 1.05 }} className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded cursor-default">📧 {preview.email}</motion.span>}
                      {preview.phone && <motion.span whileHover={{ scale: 1.05 }} className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded cursor-default">📱 {preview.phone}</motion.span>}
                      {preview.education && <motion.span whileHover={{ scale: 1.05 }} className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded cursor-default">🎓 {preview.education}</motion.span>}
                      {preview.experience && <motion.span whileHover={{ scale: 1.05 }} className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded cursor-default">💼 {preview.experience}</motion.span>}
                    </div>
                  </motion.div>
                ) : null;
              })()}
              {errors[index] && (
                <p className="mt-1 text-xs text-red-400">{errors[index]}</p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex gap-3 mt-4">
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}
          whileTap={{ scale: 0.98 }}
          onClick={addResume}
          className="flex-1 bg-[#374151] text-gray-200 py-3 px-4 rounded-lg hover:bg-gray-600 transition flex items-center justify-center gap-2 border border-gray-600 shadow-lg"
        >
          <span>+</span> 添加简历
        </motion.button>
        <motion.button
          whileHover={{ scale: loading || validCount === 0 ? 1 : 1.02, boxShadow: "0 6px 20px rgba(16, 185, 129, 0.4)" }}
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