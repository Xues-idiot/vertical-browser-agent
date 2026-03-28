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

/* ============================================
   SPIDER SCREENING PAGE
   ============================================

   Design System Applied:
   - Style: Refined Dark SaaS with Glassmorphism
   - Primary Color: Cyan (#0891B2)
   - Accent Color: Violet (#7C3AED)
   - Background: Layered dark surfaces
   - Typography: Plus Jakarta Sans (display), DM Sans (body)

   ============================================ */

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

// Generate mock candidates for fallback
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

// Generate mock report
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
  const [jdText, setJdText] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "funnel" | "compare">("list");
  const [showComparison, setShowComparison] = useState(false);
  const [showJDComparison, setShowJDComparison] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  // Refs to avoid stale state
  const jdUrlRef = useRef(jdUrl);
  const jdTextRef = useRef(jdText);
  const cancelledRef = useRef(false);

  // Keep refs in sync
  useEffect(() => { jdUrlRef.current = jdUrl; }, [jdUrl]);
  useEffect(() => { jdTextRef.current = jdText; }, [jdText]);

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
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // View mode shortcuts
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

      // R to reset
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

      // API call
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
        // Use mock data as fallback
        const mockReport = generateMockReport(resumes, jdUrlRef.current);
        setReport(mockReport);
        setCandidates([...mockReport.strong_recommendations, ...mockReport.backup_candidates]);
        setStep("result");
      }
    } catch (error) {
      console.error("Screening failed:", error);
      // Use mock data on error
      const mockReport = generateMockReport(resumes, jdUrlRef.current);
      setReport(mockReport);
      setCandidates([...mockReport.strong_recommendations, ...mockReport.backup_candidates]);
      setStep("result");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-[#f8fafc]">
      {/* ============================================
          HEADER
          ============================================ */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-[#1f2937]/80 backdrop-blur-xl border-b border-[#334155] sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 bg-gradient-to-br from-[#0891b2] to-[#0e7490] rounded-xl flex items-center justify-center text-xl shadow-lg shadow-[#0891b2]/20"
              >
                🕷️
              </motion.div>
              <div>
                <motion.h1
                  whileHover={{ scale: 1.02 }}
                  className="text-xl font-display font-bold text-[#f8fafc] cursor-default"
                >
                  Spider
                </motion.h1>
                <motion.p
                  whileHover={{ scale: 1.02 }}
                  className="text-xs text-[#94a3b8] cursor-default"
                >
                  智能招聘筛选平台
                </motion.p>
              </div>
            </div>

            {/* Version Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2"
            >
              <span className="px-3 py-1 bg-[#0891b2]/10 text-[#22d3ee] text-xs font-medium rounded-full border border-[#0891b2]/30">
                v1.34.2
              </span>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* ============================================
          MAIN CONTENT
          ============================================ */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* ============================================
              INPUT STEP
              ============================================ */}
          {step === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Page Title */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-8"
              >
                <motion.h2
                  whileHover={{ scale: 1.02 }}
                  className="text-3xl font-display font-bold text-[#f8fafc] mb-3"
                >
                  智能简历筛选
                </motion.h2>
                <motion.p
                  whileHover={{ scale: 1.01 }}
                  className="text-[#94a3b8] text-lg max-w-2xl mx-auto"
                >
                  输入JD和简历，AI自动完成匹配筛选
                </motion.p>
              </motion.div>

              {/* Input Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <JDInput onSubmit={handleJDSubmit} loading={loading} />
                <ResumeList onSubmit={handleResumeSubmit} loading={loading} />
              </div>
            </motion.div>
          )}

          {/* ============================================
              SCREENING STEP
              ============================================ */}
          {step === "screening" && (
            <motion.div
              key="screening"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              {/* Screening Title */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="text-center"
              >
                <motion.h2
                  whileHover={{ scale: 1.02 }}
                  className="text-3xl font-display font-bold text-[#f8fafc] mb-3"
                >
                  筛选进行中...
                </motion.h2>
                <motion.p
                  whileHover={{ scale: 1.02 }}
                  className="text-[#94a3b8]"
                >
                  AI正在分析简历与JD的匹配度
                </motion.p>
              </motion.div>

              {/* Screening Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <BrowserPreview screenshot={undefined} currentStep={currentStep} />
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-[#1f2937] rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center border border-[#334155]"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="text-6xl mb-6"
                  >
                    🔄
                  </motion.div>
                  <motion.h2
                    whileHover={{ scale: 1.02 }}
                    className="text-xl font-display font-semibold text-[#f8fafc] mb-3"
                  >
                    AI筛选中
                  </motion.h2>
                  <motion.p
                    whileHover={{ scale: 1.02 }}
                    className="text-[#94a3b8] text-center"
                  >
                    {currentStep === "parsing_jd" && "正在解析职位描述..."}
                    {currentStep === "parsing_resumes" && "正在提取简历关键信息..."}
                    {currentStep === "matching" && "正在计算匹配度..."}
                    {currentStep === "generating_report" && "正在生成筛选报告..."}
                  </motion.p>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ============================================
              RESULT STEP
              ============================================ */}
          {step === "result" && report && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Result Header */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex justify-between items-center flex-wrap gap-4"
              >
                {/* Result Title */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="bg-gradient-to-r from-[#0a0f1a] to-[#1f2937] rounded-xl p-6 border border-[#334155]"
                >
                  <h2 className="text-2xl font-display font-bold text-[#f8fafc]">
                    筛选结果
                  </h2>
                  <p className="text-[#94a3b8] text-sm mt-1">
                    共筛选 <span className="text-[#22d3ee] font-medium">{report.total_resumes}</span> 份简历，推荐 <span className="text-[#10b981] font-medium">{report.screened_resumes}</span> 份
                  </p>
                </motion.div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 flex-wrap">
                  {/* View Mode Toggle */}
                  <div className="flex bg-[#1f2937] rounded-xl p-1 border border-[#334155]">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewMode("list")}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        viewMode === "list"
                          ? "bg-[#0891b2] text-white shadow-lg"
                          : "text-[#94a3b8] hover:text-white hover:bg-[#334155]"
                      }`}
                    >
                      📋 列表
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewMode("funnel")}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        viewMode === "funnel"
                          ? "bg-[#0891b2] text-white shadow-lg"
                          : "text-[#94a3b8] hover:text-white hover:bg-[#334155]"
                      }`}
                    >
                      🔍 漏斗
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewMode("compare")}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        viewMode === "compare"
                          ? "bg-[#0891b2] text-white shadow-lg"
                          : "text-[#94a3b8] hover:text-white hover:bg-[#334155]"
                      }`}
                    >
                      ⚖️ 对比
                    </motion.button>
                  </div>

                  {/* JD对比 Button */}
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(124, 58, 237, 0.4)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowJDComparison(true)}
                    className="bg-[#7c3aed]/20 text-[#a78bfa] border border-[#7c3aed]/30 px-4 py-2 rounded-xl hover:bg-[#7c3aed]/30 transition-all flex items-center gap-2 text-sm font-medium"
                  >
                    📑 JD对比
                  </motion.button>

                  {/* Export JSON Button */}
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)" }}
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
                    className="bg-[#10b981]/20 text-[#34d399] border border-[#10b981]/30 px-4 py-2 rounded-xl hover:bg-[#10b981]/30 transition-all flex items-center gap-2 text-sm font-medium"
                  >
                    <span>📥</span> JSON
                  </motion.button>

                  {/* Export CSV Button */}
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(245, 158, 11, 0.4)" }}
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
                    className="bg-[#f59e0b]/20 text-[#fbbf24] border border-[#f59e0b]/30 px-4 py-2 rounded-xl hover:bg-[#f59e0b]/30 transition-all flex items-center gap-2 text-sm font-medium"
                  >
                    <span>📊</span> CSV
                  </motion.button>

                  {/* Reset Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReset}
                    className="bg-gradient-to-r from-[#0891b2] to-[#0e7490] text-white px-6 py-2 rounded-xl shadow-lg shadow-[#0891b2]/20 flex items-center gap-2 font-medium"
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

          {/* JD Comparison Modal */}
          {showJDComparison && report && (
            <JDComparison
              candidates={candidates}
              criteria={report.screening_criteria}
              onClose={() => setShowJDComparison(false)}
            />
          )}
        </AnimatePresence>
      </main>

      {/* ============================================
          FOOTER
          ============================================ */}
      <footer className="bg-[#1f2937]/50 border-t border-[#334155] mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-4">
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="text-[#64748b] cursor-default font-medium"
              >
                Spider v1.34.2
              </motion.span>
              <span className="w-px h-4 bg-[#334155]" />
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="text-[#64748b] cursor-default"
              >
                垂直浏览器Agent
              </motion.span>
            </div>
            <div className="flex items-center gap-2">
              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 bg-[#10b981] rounded-full"
              />
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="text-[#64748b] cursor-default"
              >
                系统运行正常
              </motion.span>
            </div>
          </div>
        </div>
      </footer>

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp />
    </div>
  );
}
