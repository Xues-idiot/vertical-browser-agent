"use client";

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { validateUrl, validateJDText } from "@/lib/validation";

/* ============================================
   JDINPUT COMPONENT
   ============================================

   Design System Applied:
   - Card: Elevated surface with border
   - Primary Color: Cyan (#0891B2)
   - Typography: DM Sans (body)
   - Motion: Scale on hover, smooth transitions
   ============================================ */

interface JDInputProps {
  onSubmit: (jdUrl: string, jdText?: string) => void;
  loading?: boolean;
}

// Extract key requirements from JD text
function extractJDPreview(text: string): { skills: string[]; requirements: string[] } {
  const skills: string[] = [];
  const requirements: string[] = [];

  const skillKeywords = [
    "Python", "Java", "JavaScript", "TypeScript", "React", "Vue", "Angular", "Node.js",
    "SQL", "MongoDB", "Redis", "Docker", "Kubernetes", "AWS", "GCP", "Azure",
    "Git", "Linux", "Agile", "Scrum", "TensorFlow", "PyTorch", "Machine Learning",
    "AI", "NLP", "Data Analysis", "Excel", "Power BI", "Tableau",
    "Product", "Management", "Leadership", "Communication", "Presentation",
    "SaaS", "B2B", "B2C", "E-commerce", "Fintech", "Blockchain",
  ];

  skillKeywords.forEach(skill => {
    if (text.toLowerCase().includes(skill.toLowerCase())) {
      skills.push(skill);
    }
  });

  const experienceMatch = text.match(/(\d+[\+]?\s*年|\d+[\+]?\s*years?)\s*(以上?|以上|以下|以下|-)/i);
  if (experienceMatch) {
    requirements.push(`经验要求: ${experienceMatch[0]}`);
  }

  const degreeMatch = text.match(/(本科|硕士|博士|大专|高中|学历要求)[^。]*/i);
  if (degreeMatch) {
    requirements.push(degreeMatch[0].slice(0, 30));
  }

  const salaryMatch = text.match(/(薪资?| salary)[^。]*(\d+[kK]?[-\s]?\d*[kK]?|\d+[万¥$])/i);
  if (salaryMatch) {
    requirements.push(`薪资: ${salaryMatch[0].slice(0, 20)}`);
  }

  return { skills: skills.slice(0, 8), requirements: requirements.slice(0, 3) };
}

export default function JDInput({ onSubmit, loading }: JDInputProps) {
  const [jdUrl, setJdUrl] = useState("");
  const [jdText, setJdText] = useState("");
  const [inputMode, setInputMode] = useState<"url" | "text">("url");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const jdPreview = useMemo(() => {
    if (inputMode !== "text" || jdText.length < 20) return null;
    return extractJDPreview(jdText);
  }, [jdText, inputMode]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (inputMode === "text") {
      const textValidation = validateJDText(jdText);
      if (!textValidation.valid) {
        setError(textValidation.error || "JD文本验证失败");
        return;
      }
      onSubmit(jdUrl.trim() || "文本模式", jdText.trim());
    } else {
      const urlValidation = validateUrl(jdUrl);
      if (!urlValidation.valid) {
        setError(urlValidation.error || "URL验证失败");
        return;
      }
      onSubmit(jdUrl.trim());
    }
  }, [inputMode, jdUrl, jdText, onSubmit]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#1f2937] rounded-2xl shadow-xl p-6 border border-[#334155] hover:border-[#475569] transition-all"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="w-12 h-12 bg-[#0891b2]/20 rounded-xl flex items-center justify-center text-xl border border-[#0891b2]/30"
        >
          📋
        </motion.div>
        <div>
          <motion.h2
            whileHover={{ scale: 1.02 }}
            className="text-lg font-display font-semibold text-[#f8fafc]"
          >
            输入职位JD
          </motion.h2>
          <motion.p
            whileHover={{ scale: 1.02 }}
            className="text-sm text-[#94a3b8]"
          >
            {inputMode === "url" ? "粘贴招聘平台JD链接" : "填写JD内容"}
          </motion.p>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6">
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setInputMode("url")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            inputMode === "url"
              ? "bg-[#0891b2] text-white shadow-lg shadow-[#0891b2]/20"
              : "bg-[#1f2937] text-[#94a3b8] border border-[#334155] hover:border-[#0891b2]"
          }`}
        >
          🔗 URL模式
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setInputMode("text")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            inputMode === "text"
              ? "bg-[#0891b2] text-white shadow-lg shadow-[#0891b2]/20"
              : "bg-[#1f2937] text-[#94a3b8] border border-[#334155] hover:border-[#0891b2]"
          }`}
        >
          📝 文本模式
        </motion.button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl px-4 py-3 text-[#f87171] text-sm"
          >
            {error}
          </motion.div>
        )}

        {inputMode === "url" ? (
          <div>
            <motion.label
              whileHover={{ scale: 1.02 }}
              className="block text-sm font-medium text-[#94a3b8] mb-2"
            >
              JD链接
            </motion.label>
            <input
              type="text"
              value={jdUrl}
              onChange={(e) => { setJdUrl(e.target.value); setError(null); }}
              placeholder="https://www.zhipin.com/job/... / https://www.lagou.com/jobs/..."
              className="w-full px-4 py-3 bg-[#0a0f1a] border border-[#334155] rounded-xl text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:border-[#0891b2] focus:shadow-[0_0_0_3px_rgba(6,182,212,0.2)] transition-all"
              disabled={loading}
            />
          </div>
        ) : (
          <div>
            {/* Textarea Header */}
            <div className="flex items-center justify-between mb-2">
              <motion.label
                whileHover={{ scale: 1.02 }}
                className="text-sm font-medium text-[#94a3b8]"
              >
                JD内容
              </motion.label>
              {jdText && (
                <div className="flex gap-3">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      navigator.clipboard.writeText(jdText);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className={`text-xs transition-colors flex items-center gap-1 ${
                      copied ? "text-[#10b981]" : "text-[#94a3b8] hover:text-[#22d3ee]"
                    }`}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {copied ? "已复制" : "复制"}
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setJdText("");
                      setError(null);
                    }}
                    className="text-xs text-[#94a3b8] hover:text-[#ef4444] transition-colors flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    清除
                  </motion.button>
                </div>
              )}
            </div>

            <textarea
              value={jdText}
              onChange={(e) => { setJdText(e.target.value); setError(null); }}
              placeholder="粘贴职位描述..."
              className="w-full px-4 py-3 bg-[#0a0f1a] border border-[#334155] rounded-xl text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:border-[#0891b2] focus:shadow-[0_0_0_3px_rgba(6,182,212,0.2)] resize-none transition-all"
              rows={6}
              disabled={loading}
            />

            {/* Character Count */}
            <div className="flex justify-between items-center mt-2">
              <motion.span
                whileHover={{ scale: 1.02 }}
                className="text-xs text-[#64748b] cursor-default"
              >
                {jdText.length > 0 && (
                  <>
                    已输入 <span className={jdText.length >= 50 ? "text-[#22d3ee]" : "text-[#f59e0b]"}>{jdText.length}</span> 字符
                    {jdText.length < 50 && <span className="text-[#f59e0b]">（最少50字符）</span>}
                  </>
                )}
              </motion.span>
            </div>

            {/* JD Preview */}
            {jdPreview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                whileHover={{ scale: 1.01 }}
                className="mt-4 bg-[#0a0f1a] rounded-xl p-4 border border-[#0891b2]/30 shadow-lg shadow-[#0891b2]/10"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-xs text-[#22d3ee] mb-3 flex items-center gap-2 cursor-default"
                >
                  <span>🔍</span> JD智能解析预览
                </motion.div>

                {/* Skills */}
                {jdPreview.skills.length > 0 && (
                  <div className="mb-3">
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      className="text-xs text-[#64748b] cursor-default"
                    >
                      识别技能:
                    </motion.span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {jdPreview.skills.map(skill => (
                        <motion.span
                          key={skill}
                          whileHover={{ scale: 1.05, boxShadow: "0 0 8px rgba(34, 211, 238, 0.4)" }}
                          className="bg-[#0891b2]/20 text-[#22d3ee] px-3 py-1 rounded-full text-xs cursor-default border border-[#0891b2]/30"
                        >
                          {skill}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Requirements */}
                {jdPreview.requirements.length > 0 && (
                  <div>
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      className="text-xs text-[#64748b] cursor-default"
                    >
                      关键要求:
                    </motion.span>
                    <ul className="mt-2 space-y-1">
                      {jdPreview.requirements.map((req, i) => (
                        <motion.li
                          key={i}
                          whileHover={{ x: 4, color: "#22d3ee" }}
                          className="text-xs text-[#94a3b8] flex items-center gap-2 cursor-default"
                        >
                          <span className="w-1.5 h-1.5 bg-[#0891b2] rounded-full" />
                          {req}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={loading || (inputMode === "url" ? !jdUrl.trim() : !jdText.trim())}
          whileHover={{ scale: loading ? 1 : 1.02, boxShadow: "0 8px 30px rgba(6, 182, 212, 0.4)" }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className="w-full bg-gradient-to-r from-[#0891b2] to-[#0e7490] text-white py-4 px-4 rounded-xl font-medium shadow-lg shadow-[#0891b2]/20 disabled:from-[#334155] disabled:to-[#1f2937] disabled:cursor-not-allowed disabled:shadow-none transition-all flex items-center justify-center gap-2"
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
