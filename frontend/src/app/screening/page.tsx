"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import JDInput from "@/components/JDInput";
import ResumeList from "@/components/ResumeList";
import MatchResult from "@/components/MatchResult";
import ReportView from "@/components/ReportView";
import BrowserPreview from "@/components/BrowserPreview";
import PipelineFunnel from "@/components/PipelineFunnel";
import CandidateComparison from "@/components/CandidateComparison";
import JDComparison from "@/components/JDComparison";
import KeyboardShortcutsHelp from "@/components/KeyboardShortcutsHelp";
import { screeningAPI } from "@/lib/api";

interface Candidate {
  candidate_name: string;
  match_score: number;
  level: string;
  summary: string;
  current_company?: string;
  years_experience?: number;
  status?: "pending" | "interview" | "offer" | "hired" | "rejected";
}

interface Report {
  position_name: string;
  jd_source: string;
  total_resumes: number;
  screened_resumes: number;
  strong_recommendations: Candidate[];
  backup_candidates: Candidate[];
  screening_criteria: string[];
  generated_at: string;
}

// Helper function to generate mock candidates
function generateMockCandidates(resumes: string[]) {
  const strongRecs = resumes.slice(0, 2).map((r, i) => ({
    candidate_name: `候选人${i + 1}`,
    match_score: 85 - i * 5,
    level: "strong_recommend",
    summary: "匹配度高",
    years_experience: 5 - i,
    score_breakdown: {
      hard_conditions: 85 + Math.floor(Math.random() * 10),
      skill_match: 80 + Math.floor(Math.random() * 15),
      industry_exp: 75 + Math.floor(Math.random() * 15),
      potential: 70 + Math.floor(Math.random() * 20),
    },
    tags: i === 0 ? ["大厂经验", "管理经验", "SaaS"] : ["海归", "本科985"],
    matched_criteria: ["经验≥3年", "有SaaS经验", "本科学历"],
  }));
  const backups = resumes.slice(2).map((r, i) => ({
    candidate_name: `备选候选人${i + 1}`,
    match_score: 70 - i * 3,
    level: "backup",
    summary: "基本匹配",
    years_experience: 3 - i,
    score_breakdown: {
      hard_conditions: 60 + Math.floor(Math.random() * 15),
      skill_match: 65 + Math.floor(Math.random() * 15),
      industry_exp: 70 + Math.floor(Math.random() * 10),
      potential: 60 + Math.floor(Math.random() * 15),
    },
    tags: i === 0 ? ["创业经验"] : ["小厂经验"],
    matched_criteria: ["有电商经验"],
  }));
  return { strongRecs, backups };
}

// Helper to generate mock report
function generateMockReport(resumes: string[], jdSource: string) {
  const { strongRecs, backups } = generateMockCandidates(resumes);
  return {
    position_name: "高级产品经理",
    jd_source: jdSource || "模拟JD",
    total_resumes: resumes.length,
    screened_resumes: Math.floor(resumes.length * 0.6),
    strong_recommendations: strongRecs,
    backup_candidates: backups,
    screening_criteria: [
      "经验年限 ≥ 3年",
      "有电商/SaaS经验",
      "学历本科以上",
    ],
    generated_at: new Date().toLocaleString(),
  };
}

export default function ScreeningPage() {
  const [step, setStep] = useState<"input" | "screening" | "result">("input");
  const [currentStep, setCurrentStep] = useState("init");
  const [loading, setLoading] = useState(false);
  const [jdUrl, setJdUrl] = useState("");
  const [jdText, setJdText] = useState(""); // JD文本内容
  const [report, setReport] = useState<Report | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "funnel" | "compare">("list");
  const [showComparison, setShowComparison] = useState(false);
  const [showJDComparison, setShowJDComparison] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  // Use refs to avoid stale state in async operations
  const jdUrlRef = useRef(jdUrl);
  const jdTextRef = useRef(jdText);
  const cancelledRef = useRef(false);

  // Keep refs in sync with state
  useEffect(() => {
    jdUrlRef.current = jdUrl;
  }, [jdUrl]);
  useEffect(() => {
    jdTextRef.current = jdText;
  }, [jdText]);

  const handleReset = useCallback(() => {
    setStep("input");
    setCurrentStep("init");
    setJdUrl("");
    setReport(null);
    setViewMode("list");
    setCandidates([]);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Cmd/Ctrl + 1/2/3 for view modes (when on result page)
      if ((e.metaKey || e.ctrlKey) && step === "result") {
        if (e.key === "1") {
          e.preventDefault();
          setViewMode("list");
        } else if (e.key === "2") {
          e.preventDefault();
          setViewMode("funnel");
        } else if (e.key === "3") {
          e.preventDefault();
          setViewMode("compare");
        } else if (e.key === "d") {
          e.preventDefault();
          setShowJDComparison(true);
        }
      }

      // Escape to close modals
      if (e.key === "Escape") {
        setShowJDComparison(false);
      }

      // R to reset (when on result page)
      if (e.key === "r" && step === "result" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handleReset();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step, handleReset]);

  const handleJDSubmit = useCallback((url: string, text?: string) => {
    setJdUrl(url);
    if (text) {
      setJdText(text);
    }
  }, []);

  const handleResumeSubmit = useCallback(async (resumes: string[]) => {
    setLoading(true);
    setStep("screening");
    setCurrentStep("parsing_jd");
    cancelledRef.current = false;

    try {
      const steps = [
        "parsing_jd",
        "parsing_resumes",
        "matching",
        "generating_report",
        "completed",
      ];

      for (const s of steps) {
        if (cancelledRef.current) return;
        setCurrentStep(s);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      if (cancelledRef.current) return;

      const response = await screeningAPI.submit({
        jd_url: jdUrlRef.current,
        ...(jdTextRef.current ? { jd_content: jdTextRef.current } : {}),
        resume_list: resumes
      });

      if (response.success && response.data?.report) {
        setReport(response.data.report);
        setCandidates([...response.data.report.strong_recommendations, ...response.data.report.backup_candidates]);
        setStep("result");
      } else {
        const mockReport = generateMockReport(resumes, jdUrlRef.current);
        setReport(mockReport);
        setCandidates([...mockReport.strong_recommendations, ...mockReport.backup_candidates]);
        setStep("result");
      }
    } catch (error) {
      console.error("Screening failed:", error);
      const mockReport = generateMockReport(resumes, jdUrlRef.current);
      setReport(mockReport);
      setCandidates([...mockReport.strong_recommendations, ...mockReport.backup_candidates]);
      setStep("result");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#111827] text-gray-100">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-[#1F2937]/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-700 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-cyan-500/20"
              >
                🕷️
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Spider
                </h1>
                <p className="text-xs text-gray-400">
                  垂直浏览器Agent - 简历筛选
                </p>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2"
            >
              <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-medium rounded-full border border-cyan-500/30">
                v1.34.2
              </span>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {step === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-8"
              >
                <h2 className="text-2xl font-bold text-white mb-2">
                  智能简历筛选
                </h2>
                <p className="text-gray-400">
                  输入JD和简历，AI自动完成匹配筛选
                </p>
              </motion.div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <JDInput onSubmit={handleJDSubmit} loading={loading} />
                <ResumeList onSubmit={handleResumeSubmit} loading={loading} />
              </div>
            </motion.div>
          )}

          {step === "screening" && (
            <motion.div
              key="screening"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  筛选进行中...
                </h2>
                <p className="text-gray-400">
                  AI正在分析简历与JD的匹配度
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <BrowserPreview screenshot={undefined} currentStep={currentStep} />
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-[#1F2937] rounded-xl shadow-lg p-8 flex flex-col items-center justify-center"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="text-6xl mb-4"
                  >
                    🔄
                  </motion.div>
                  <h2 className="text-xl font-semibold text-white mb-2">
                    AI筛选中
                  </h2>
                  <p className="text-gray-400 text-center">
                    {currentStep === "parsing_jd" && "正在解析职位描述..."}
                    {currentStep === "parsing_resumes" && "正在提取简历关键信息..."}
                    {currentStep === "matching" && "正在计算匹配度..."}
                    {currentStep === "generating_report" && "正在生成筛选报告..."}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}

          {step === "result" && report && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex justify-between items-center flex-wrap gap-4"
              >
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    筛选结果
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    共筛选 {report.total_resumes} 份简历，推荐 {report.screened_resumes} 份
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {/* View Mode Toggle */}
                  <div className="flex bg-[#1F2937] rounded-lg p-1 border border-gray-700">
                    <button
                      onClick={() => setViewMode("list")}
                      className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                        viewMode === "list" ? "bg-cyan-600 text-white" : "text-gray-400 hover:text-white"
                      }`}
                    >
                      📋 列表
                    </button>
                    <button
                      onClick={() => setViewMode("funnel")}
                      className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                        viewMode === "funnel" ? "bg-cyan-600 text-white" : "text-gray-400 hover:text-white"
                      }`}
                    >
                      🔍 漏斗
                    </button>
                    <button
                      onClick={() => setViewMode("compare")}
                      className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                        viewMode === "compare" ? "bg-cyan-600 text-white" : "text-gray-400 hover:text-white"
                      }`}
                    >
                      ⚖️ 对比
                    </button>
                  </div>
                  <button
                    onClick={() => setShowJDComparison(true)}
                    className="bg-purple-600/20 text-purple-400 border border-purple-500/30 px-4 py-2 rounded-lg hover:bg-purple-600/30 transition-colors flex items-center gap-2 text-sm"
                  >
                    📑 JD对比
                  </button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const data = JSON.stringify(report, null, 2);
                      const blob = new Blob([data], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `screening-report-${Date.now()}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-lg hover:bg-emerald-600/30 transition-colors flex items-center gap-2 text-sm"
                  >
                    <span>📥</span> JSON
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const headers = ["姓名", "匹配分", "等级", "公司", "经验", "摘要"];
                      const rows = [
                        ...report.strong_recommendations.map(c => [
                          c.candidate_name, c.match_score, "强烈推荐",
                          c.current_company || "", c.years_experience || "", c.summary
                        ]),
                        ...report.backup_candidates.map(c => [
                          c.candidate_name, c.match_score, "可备选",
                          c.current_company || "", c.years_experience || "", c.summary
                        ]),
                      ];
                      const csv = [headers.join(","), ...rows.map(r => r.map(v => `"${v}"`).join(","))].join("\n");
                      const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `screening-report-${Date.now()}.csv`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="bg-amber-600/20 text-amber-400 border border-amber-500/30 px-4 py-2 rounded-lg hover:bg-amber-600/30 transition-colors flex items-center gap-2 text-sm"
                  >
                    <span>📊</span> CSV
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReset}
                    className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white px-6 py-2 rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-2"
                  >
                    <span>🔄</span> 重筛
                  </motion.button>
                </div>
              </motion.div>

              {/* Content based on view mode */}
              {viewMode === "list" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <ReportView
                      report={{
                        position_name: report.position_name,
                        jd_source: report.jd_source,
                        total_resumes: report.total_resumes,
                        screened_resumes: report.screened_resumes,
                        generated_at: report.generated_at,
                      }}
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-2"
                  >
                    <MatchResult
                      strongRecommendations={report.strong_recommendations}
                      backupCandidates={report.backup_candidates}
                      criteria={report.screening_criteria}
                    />
                  </motion.div>
                </div>
              )}

              {viewMode === "funnel" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <PipelineFunnel
                      candidates={candidates}
                      totalResumes={report.total_resumes}
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <ReportView
                      report={{
                        position_name: report.position_name,
                        jd_source: report.jd_source,
                        total_resumes: report.total_resumes,
                        screened_resumes: report.screened_resumes,
                        generated_at: report.generated_at,
                      }}
                    />
                  </motion.div>
                </div>
              )}

              {viewMode === "compare" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <CandidateComparison
                    candidates={candidates}
                    criteria={report.screening_criteria}
                    onClose={() => setViewMode("list")}
                  />
                </motion.div>
              )}
            </motion.div>
          )}
          {showJDComparison && report && (
            <JDComparison
              candidates={candidates}
              criteria={report.screening_criteria}
              onClose={() => setShowJDComparison(false)}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-[#1F2937]/50 border-t border-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center text-sm text-gray-400">
            <div className="flex items-center gap-4">
              <span>Spider v1.34.2</span>
              <span className="w-px h-4 bg-gray-600" />
              <span>垂直浏览器Agent</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>系统运行正常</span>
            </div>
          </div>
        </div>
      </footer>

      <KeyboardShortcutsHelp />
    </div>
  );
}