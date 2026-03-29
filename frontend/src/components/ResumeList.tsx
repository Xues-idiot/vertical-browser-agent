"use client";

import { useState, useCallback, useMemo, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { validateResumeText } from "@/lib/validation";

/* ============================================
   RESUMELIST COMPONENT
   ============================================

   Design System Applied:
   - Card: Elevated surface with emerald accents
   - Accent Color: Emerald (#10b981)
   - Typography: DM Sans (body)
   - Motion: Scale on hover, smooth transitions
   ============================================ */

interface ResumeListProps {
  onSubmit: (resumes: string[]) => void;
  loading?: boolean;
}

// Extract key info from resume text
function extractResumePreview(text: string): { name?: string; email?: string; phone?: string; education?: string; experience?: string } {
  const result: { name?: string; email?: string; phone?: string; education?: string; experience?: string } = {};

  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) result.email = emailMatch[0];

  const phoneMatch = text.match(/1[3-9]\d{9}/);
  if (phoneMatch) result.phone = phoneMatch[0];

  const eduKeywords = ["本科", "硕士", "博士", "大专", "高中", "985", "211", "研究生"];
  for (const kw of eduKeywords) {
    if (text.includes(kw)) {
      result.education = kw;
      break;
    }
  }

  const expMatch = text.match(/(\d+)\s*年/);
  if (expMatch) result.experience = `${expMatch[1]}年`;

  return result;
}

export default function ResumeList({ onSubmit, loading }: ResumeListProps) {
  const uniqueId = useId();
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
      className="bg-[#1f2937] rounded-2xl shadow-xl p-6 border border-[#334155] hover:border-[#475569] transition-all"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <motion.div
          whileHover={{ scale: 1.1, rotate: -5 }}
          className="w-12 h-12 bg-[#10b981]/20 rounded-xl flex items-center justify-center text-xl border border-[#10b981]/30"
        >
          📄
        </motion.div>
        <div>
          <motion.h2
            whileHover={{ scale: 1.02 }}
            className="text-lg font-display font-semibold text-[#f8fafc]"
          >
            输入简历
          </motion.h2>
          <motion.p
            whileHover={{ scale: 1.02 }}
            className="text-sm text-[#94a3b8]"
          >
            粘贴候选人简历内容
          </motion.p>
        </div>
      </div>

      {/* Resume List */}
      <div className="space-y-4">
        <AnimatePresence>
          {resumes.map((_, index) => (
            <motion.div
              key={`${uniqueId}-${index}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="border border-[#334155] rounded-xl p-4 bg-[#0a0f1a]"
            >
              {/* Resume Header */}
              <div className="flex justify-between items-center mb-3">
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="text-sm font-medium text-[#f8fafc]"
                >
                  简历 {index + 1}
                </motion.span>
                {resumes.length > 1 && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeResume(index)}
                    className="text-[#ef4444] hover:text-[#f87171] text-sm flex items-center gap-1 transition-colors"
                  >
                    <span>×</span> 删除
                  </motion.button>
                )}
              </div>

              {/* Name Input */}
              <input
                type="text"
                value={candidateNames[index]}
                onChange={(e) => updateName(index, e.target.value)}
                placeholder="候选人姓名（可选）"
                disabled={loading}
                className="w-full px-3 py-2 bg-[#0a0f1a] border border-[#334155] rounded-lg mb-3 text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:border-[#10b981] focus:shadow-[0_0_0_3px_rgba(16,185,129,0.2)] transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              />

              {/* Resume Textarea */}
              <div className="relative">
                <textarea
                  value={resumes[index]}
                  onChange={(e) => updateResume(index, e.target.value)}
                  placeholder="粘贴简历内容..."
                  rows={5}
                  disabled={loading}
                  className="w-full px-3 py-2 bg-[#0a0f1a] border border-[#334155] rounded-lg text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:border-[#10b981] focus:shadow-[0_0_0_3px_rgba(16,185,129,0.2)] resize-none transition-all pr-20 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                />

                {/* Action Buttons */}
                {resumes[index] && !loading && (
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
                      className={`text-xs transition-colors flex items-center gap-1 bg-[#1f2937]/80 px-2 py-1 rounded-lg ${
                        copiedIndex === index ? "text-[#10b981]" : "text-[#94a3b8] hover:text-[#10b981]"
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
                      className="text-xs text-[#94a3b8] hover:text-[#ef4444] transition-colors flex items-center gap-1 bg-[#1f2937]/80 px-2 py-1 rounded-lg"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  </div>
                )}
              </div>

              {/* Character Count */}
              {resumes[index] && (
                <div className="flex justify-between items-center mt-2 px-1">
                  <motion.span
                    whileHover={{ scale: 1.02 }}
                    className="text-xs text-[#64748b] cursor-default"
                  >
                    已输入 <span className={resumes[index].length >= 20 ? "text-[#10b981]" : "text-[#f59e0b]"}>{resumes[index].length}</span> 字符
                    {resumes[index].length < 20 && <span className="text-[#f59e0b]">（最少20字符）</span>}
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
                    className="mt-3 bg-[#1f2937] rounded-xl p-3 border border-[#10b981]/30 shadow-lg shadow-[#10b981]/10"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="text-xs text-[#10b981] mb-2 cursor-default flex items-center gap-1"
                    >
                      📋 智能提取:
                    </motion.div>
                    <div className="flex flex-wrap gap-2">
                      {preview.name && (
                        <motion.span
                          whileHover={{ scale: 1.05 }}
                          className="text-xs bg-[#3b82f6]/20 text-[#60a5fa] px-2 py-1 rounded-lg cursor-default"
                        >
                          姓名: {preview.name}
                        </motion.span>
                      )}
                      {preview.email && (
                        <motion.span
                          whileHover={{ scale: 1.05 }}
                          className="text-xs bg-[#10b981]/20 text-[#34d399] px-2 py-1 rounded-lg cursor-default"
                        >
                          📧 {preview.email}
                        </motion.span>
                      )}
                      {preview.phone && (
                        <motion.span
                          whileHover={{ scale: 1.05 }}
                          className="text-xs bg-[#8b5cf6]/20 text-[#a78bfa] px-2 py-1 rounded-lg cursor-default"
                        >
                          📱 {preview.phone}
                        </motion.span>
                      )}
                      {preview.education && (
                        <motion.span
                          whileHover={{ scale: 1.05 }}
                          className="text-xs bg-[#f59e0b]/20 text-[#fbbf24] px-2 py-1 rounded-lg cursor-default"
                        >
                          🎓 {preview.education}
                        </motion.span>
                      )}
                      {preview.experience && (
                        <motion.span
                          whileHover={{ scale: 1.05 }}
                          className="text-xs bg-[#0891b2]/20 text-[#22d3ee] px-2 py-1 rounded-lg cursor-default"
                        >
                          💼 {preview.experience}
                        </motion.span>
                      )}
                    </div>
                  </motion.div>
                ) : null;
              })()}

              {/* Error Message */}
              {errors[index] && (
                <p className="mt-2 text-xs text-[#ef4444]">{errors[index]}</p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <motion.button
          whileHover={{ scale: loading ? 1 : 1.02, boxShadow: loading ? "none" : "0 4px 15px rgba(0,0,0,0.3)" }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          onClick={addResume}
          disabled={loading}
          className="flex-1 bg-[#1f2937] text-[#94a3b8] py-3 px-4 rounded-xl hover:bg-[#334155] transition-all flex items-center justify-center gap-2 border border-[#334155] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>+</span> 添加简历
        </motion.button>
        <motion.button
          whileHover={{ scale: loading || validCount === 0 ? 1 : 1.02, boxShadow: "0 8px 30px rgba(16, 185, 129, 0.4)" }}
          whileTap={{ scale: loading || validCount === 0 ? 1 : 0.98 }}
          onClick={handleSubmit}
          disabled={loading || validCount === 0}
          className="flex-1 bg-gradient-to-r from-[#10b981] to-[#059669] text-white py-3 px-4 rounded-xl disabled:from-[#334155] disabled:to-[#1f2937] disabled:cursor-not-allowed disabled:shadow-none transition-all font-medium shadow-lg shadow-[#10b981]/20 flex items-center justify-center gap-2"
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
