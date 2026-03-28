"use client";

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { validateUrl, validateJDText } from "@/lib/validation";

interface JDInputProps {
  onSubmit: (jdUrl: string, jdText?: string) => void;
  loading?: boolean;
}

// Extract key requirements from JD text
function extractJDPreview(text: string): { skills: string[]; requirements: string[] } {
  const skills: string[] = [];
  const requirements: string[] = [];

  // Common skill keywords to look for
  const skillKeywords = [
    "Python", "Java", "JavaScript", "TypeScript", "React", "Vue", "Angular", "Node.js",
    "SQL", "MongoDB", "Redis", "Docker", "Kubernetes", "AWS", "GCP", "Azure",
    "Git", "Linux", "Agile", "Scrum", "TensorFlow", "PyTorch", "Machine Learning",
    "AI", "NLP", "Data Analysis", "Excel", "Power BI", "Tableau",
    "Product", "Management", "Leadership", "Communication", "Presentation",
    "SaaS", "B2B", "B2C", "E-commerce", "Fintech", "Blockchain",
  ];

  // Extract skills
  skillKeywords.forEach(skill => {
    if (text.toLowerCase().includes(skill.toLowerCase())) {
      skills.push(skill);
    }
  });

  // Extract requirements patterns
  const experienceMatch = text.match(/(\d+[\+]?\s*年|\d+[\+]?\s*years?)\s*(以上?|以上|以下|以下|-)/i);
  if (experienceMatch) {
    requirements.push(`经验要求: ${experienceMatch[0]}`);
  }

  const degreeMatch = text.match(/(本科|硕士|博士|大专|高中|学历要求)[^。]*/i);
  if (degreeMatch) {
    requirements.push(degreeMatch[0].slice(0, 30));
  }

  // Extract salary if present
  const salaryMatch = text.match(/(薪资?| salary)[^。]*(\d+[kK]?[-\s]?\d*[kK]?|\d+[万¥$])/i);
  if (salaryMatch) {
    requirements.push(`薪资: ${salaryMatch[0].slice(0, 20)}`);
  }

  return { skills: skills.slice(0, 8), requirements: requirements.slice(0, 3) };
}

export default function JDInput({ onSubmit, loading }: JDInputProps) {
  const [jdUrl, setJdUrl] = useState("");
  const [jdText, setJdText] = useState(""); // JD文本内容
  const [inputMode, setInputMode] = useState<"url" | "text">("url"); // 输入模式
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Compute JD preview when text changes
  const jdPreview = useMemo(() => {
    if (inputMode !== "text" || jdText.length < 20) return null;
    return extractJDPreview(jdText);
  }, [jdText, inputMode]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 验证
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
          <p className="text-sm text-gray-400">
            {inputMode === "url" ? "粘贴招聘平台JD链接" : "填写JD内容"}
          </p>
        </div>
      </div>

      {/* 模式切换 */}
      <div className="flex gap-2 mb-4">
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setInputMode("url")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            inputMode === "url"
              ? "bg-cyan-600 text-white"
              : "bg-[#111827] text-gray-400 border border-gray-700 hover:border-cyan-500"
          }`}
        >
          🔗 URL模式
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setInputMode("text")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            inputMode === "text"
              ? "bg-cyan-600 text-white"
              : "bg-[#111827] text-gray-400 border border-gray-700 hover:border-cyan-500"
          }`}
        >
          📝 文本模式
        </motion.button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg px-4 py-2 text-red-400 text-sm">
            {error}
          </div>
        )}
        {inputMode === "url" ? (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              JD链接
            </label>
            <input
              type="text"
              value={jdUrl}
              onChange={(e) => { setJdUrl(e.target.value); setError(null); }}
              placeholder="https://www.zhipin.com/job/... / https://www.lagou.com/jobs/... / https://www.boss.com/..."
              className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition bg-[#111827] text-white placeholder-gray-500"
              disabled={loading}
            />
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">
                JD内容
              </label>
              {jdText && (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(jdText);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className={`text-xs transition-colors flex items-center gap-1 ${
                      copied ? "text-emerald-400" : "text-gray-400 hover:text-cyan-400"
                    }`}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {copied ? "已复制" : "复制"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setJdText("");
                      setError(null);
                    }}
                    className="text-xs text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    清除
                  </button>
                </div>
              )}
            </div>
            <textarea
              value={jdText}
              onChange={(e) => { setJdText(e.target.value); setError(null); }}
              placeholder="粘贴职位描述..."
              className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition bg-[#111827] text-white placeholder-gray-500 resize-none"
              rows={6}
              disabled={loading}
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-500">
                {jdText.length > 0 && (
                  <>
                    已输入 <span className={jdText.length >= 50 ? "text-cyan-400" : "text-amber-400"}>{jdText.length}</span> 字符
                    {jdText.length < 50 && <span className="text-amber-400">（最少50字符）</span>}
                  </>
                )}
              </span>
            </div>
            {/* JD Preview */}
            {jdPreview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-3 bg-[#111827] rounded-lg p-3 border border-cyan-500/30 shadow-lg shadow-cyan-500/10"
              >
                <div className="text-xs text-cyan-400 mb-2 flex items-center gap-1">
                  <span>🔍</span> JD智能解析预览
                </div>
                {jdPreview.skills.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs text-gray-500">识别技能: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {jdPreview.skills.map(skill => (
                        <motion.span
                          key={skill}
                          whileHover={{ scale: 1.05 }}
                          className="bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded text-xs cursor-default"
                        >
                          {skill}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}
                {jdPreview.requirements.length > 0 && (
                  <div>
                    <span className="text-xs text-gray-500">关键要求: </span>
                    <ul className="mt-1 space-y-1">
                      {jdPreview.requirements.map((req, i) => (
                        <li key={i} className="text-xs text-gray-300 flex items-center gap-1">
                          <span className="w-1 h-1 bg-cyan-400 rounded-full" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}
        <motion.button
          type="submit"
          disabled={loading || (inputMode === "url" ? !jdUrl.trim() : !jdText.trim())}
          whileHover={{ scale: loading ? 1 : 1.02, boxShadow: "0 6px 20px rgba(34, 211, 238, 0.4)" }}
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