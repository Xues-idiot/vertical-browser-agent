"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { type Report, type JDInfo, type ResumeInfo } from "@/lib/api";

type ScreeningStep = "init" | "parsing_jd" | "parsing_resumes" | "matching" | "generating_report" | "completed";

interface AppState {
  // 筛选相关
  jdUrl: string;
  setJdUrl: (url: string) => void;

  resumes: string[];
  setResumes: (resumes: string[]) => void;

  report: Report | null;
  setReport: (report: Report | null) => void;

  currentStep: ScreeningStep;
  setCurrentStep: (step: ScreeningStep) => void;

  // UI相关
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  error: string | null;
  setError: (error: string | null) => void;

  // 解析数据
  jdInfo: JDInfo | null;
  setJdInfo: (info: JDInfo | null) => void;

  resumeInfos: ResumeInfo[];
  setResumeInfos: (infos: ResumeInfo[]) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  // 筛选相关状态
  const [jdUrl, setJdUrl] = useState("");
  const [resumes, setResumes] = useState<string[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [currentStep, setCurrentStep] = useState<ScreeningStep>("init");

  // UI相关状态
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 解析数据
  const [jdInfo, setJdInfo] = useState<JDInfo | null>(null);
  const [resumeInfos, setResumeInfos] = useState<ResumeInfo[]>([]);

  const value: AppState = {
    jdUrl,
    setJdUrl,
    resumes,
    setResumes,
    report,
    setReport,
    currentStep,
    setCurrentStep,
    isLoading,
    setIsLoading,
    error,
    setError,
    jdInfo,
    setJdInfo,
    resumeInfos,
    setResumeInfos,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}