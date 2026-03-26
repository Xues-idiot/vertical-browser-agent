"use client";

import { useState, useCallback, useRef } from "react";
import { screeningAPI, type Report, type JDInfo, type ResumeInfo } from "@/lib/api";

interface UseScreeningReturn {
  loading: boolean;
  error: Error | null;
  data: Report | null;
  currentStep: string;
  submit: (jdUrl: string, resumes: string[]) => Promise<Report | null>;
  parseJD: (jdText: string) => Promise<JDInfo | null>;
  parseResume: (resumeText: string) => Promise<ResumeInfo | null>;
  reset: () => void;
}

export function useScreening(): UseScreeningReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<Report | null>(null);
  const [currentStep, setCurrentStep] = useState("init");
  const cancelledRef = useRef(false);

  const submit = useCallback(async (jdUrl: string, resumes: string[]): Promise<Report | null> => {
    setLoading(true);
    setError(null);
    setCurrentStep("parsing_jd");
    cancelledRef.current = false;

    try {
      // Simulate step progression
      const steps = ["parsing_jd", "parsing_resumes", "matching", "generating_report", "completed"];

      for (const step of steps) {
        if (cancelledRef.current) {
          return null;
        }
        setCurrentStep(step);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      if (cancelledRef.current) return null;

      const result = await screeningAPI.submit({ jd_url: jdUrl, resume_list: resumes });

      if (result.success && result.report) {
        setData(result.report);
        return result.report;
      } else {
        throw new Error(result.error || "筛选失败");
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("未知错误");
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const parseJD = useCallback(async (jdText: string): Promise<JDInfo | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await screeningAPI.parseJD({ jd_text: jdText });

      if (result.success && result.data?.jd_info) {
        return result.data.jd_info;
      } else {
        throw new Error(result.error || "JD解析失败");
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("未知错误");
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const parseResume = useCallback(async (resumeText: string): Promise<ResumeInfo | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await screeningAPI.parseResume({ resume_text: resumeText });

      if (result.success && result.data?.resume_info) {
        return result.data.resume_info;
      } else {
        throw new Error(result.error || "简历解析失败");
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("未知错误");
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
    setCurrentStep("init");
  }, []);

  return { loading, error, data, currentStep, submit, parseJD, parseResume, reset };
}