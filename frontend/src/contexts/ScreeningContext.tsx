"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface JDInfo {
  position_name: string;
  experience_required: number;
  education_required: string;
  skills_required: string[];
  industry_required: string[];
}

interface ResumeInfo {
  candidate_name: string;
  current_position?: string;
  current_company?: string;
  years_experience?: number;
  education?: string;
  skills?: string[];
}

interface ScreeningState {
  step: "idle" | "input" | "parsing" | "matching" | "complete" | "error";
  jdUrl: string;
  jdInfo: JDInfo | null;
  resumes: string[];
  resumeInfos: ResumeInfo[];
  progress: number;
  error: string | null;
}

interface ScreeningContextValue extends ScreeningState {
  setJdUrl: (url: string) => void;
  setJdInfo: (info: JDInfo | null) => void;
  addResume: (resume: string) => void;
  removeResume: (index: number) => void;
  setResumeInfos: (infos: ResumeInfo[]) => void;
  setStep: (step: ScreeningState["step"]) => void;
  setProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: ScreeningState = {
  step: "idle",
  jdUrl: "",
  jdInfo: null,
  resumes: [],
  resumeInfos: [],
  progress: 0,
  error: null,
};

const ScreeningContext = createContext<ScreeningContextValue | null>(null);

export function ScreeningProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ScreeningState>(initialState);

  const setJdUrl = useCallback((url: string) => {
    setState((prev) => ({ ...prev, jdUrl: url }));
  }, []);

  const setJdInfo = useCallback((info: JDInfo | null) => {
    setState((prev) => ({ ...prev, jdInfo: info }));
  }, []);

  const addResume = useCallback((resume: string) => {
    setState((prev) => ({ ...prev, resumes: [...prev.resumes, resume] }));
  }, []);

  const removeResume = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      resumes: prev.resumes.filter((_, i) => i !== index),
    }));
  }, []);

  const setResumeInfos = useCallback((infos: ResumeInfo[]) => {
    setState((prev) => ({ ...prev, resumeInfos: infos }));
  }, []);

  const setStep = useCallback((step: ScreeningState["step"]) => {
    setState((prev) => ({ ...prev, step }));
  }, []);

  const setProgress = useCallback((progress: number) => {
    setState((prev) => ({ ...prev, progress }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error, step: error ? "error" : prev.step }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const value: ScreeningContextValue = {
    ...state,
    setJdUrl,
    setJdInfo,
    addResume,
    removeResume,
    setResumeInfos,
    setStep,
    setProgress,
    setError,
    reset,
  };

  return (
    <ScreeningContext.Provider value={value}>
      {children}
    </ScreeningContext.Provider>
  );
}

export function useScreening() {
  const context = useContext(ScreeningContext);
  if (!context) {
    throw new Error("useScreening must be used within ScreeningProvider");
  }
  return context;
}