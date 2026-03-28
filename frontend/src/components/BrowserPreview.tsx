"use client";

import { motion } from "framer-motion";

/* ============================================
   BROWSERPREVIEW COMPONENT
   ============================================

   Design System Applied:
   - Browser chrome: Dark gray gradient
   - Primary Color: Cyan (#0891B2)
   - Motion: Smooth transitions, glow effects
   ============================================ */

interface BrowserPreviewProps {
  screenshot?: string;
  currentStep: string;
}

const steps = [
  { key: "init", label: "等待开始", icon: "⏳", description: "准备开始筛选..." },
  { key: "parsing_jd", label: "解析JD", icon: "📋", description: "提取职位要求、技能关键词" },
  { key: "parsing_resumes", label: "解析简历", icon: "📄", description: "提取候选人关键信息" },
  { key: "matching", label: "匹配评分", icon: "🔍", description: "计算JD与简历匹配度" },
  { key: "generating_report", label: "生成报告", icon: "📊", description: "生成结构化筛选报告" },
  { key: "completed", label: "完成", icon: "✅", description: "筛选完成，可查看结果" },
];

export default function BrowserPreview({ screenshot, currentStep }: BrowserPreviewProps) {
  const currentIndex = steps.findIndex(s => s.key === currentStep);
  const isCompleted = currentStep === "completed";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-[#1f2937] rounded-2xl shadow-xl border border-[#334155] overflow-hidden"
    >
      {/* Browser Chrome */}
      <div className="bg-gradient-to-r from-[#334155] to-[#1f2937] px-4 py-3 flex items-center justify-between border-b border-[#334155]">
        <div className="flex items-center gap-4">
          {/* Traffic Lights */}
          <div className="flex gap-2">
            <motion.div
              whileHover={{ scale: 1.2 }}
              className="w-3 h-3 rounded-full bg-[#ef4444] cursor-pointer shadow-lg shadow-[#ef4444]/40"
            />
            <motion.div
              whileHover={{ scale: 1.2 }}
              className="w-3 h-3 rounded-full bg-[#f59e0b] cursor-pointer shadow-lg shadow-[#f59e0b]/40"
            />
            <motion.div
              whileHover={{ scale: 1.2 }}
              className="w-3 h-3 rounded-full bg-[#10b981] cursor-pointer shadow-lg shadow-[#10b981]/40"
            />
          </div>
          <motion.span
            whileHover={{ scale: 1.02 }}
            className="text-[#94a3b8] text-sm font-medium cursor-default"
          >
            浏览器预览
          </motion.span>
        </div>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-[#64748b]"
        >
          {isCompleted ? "✅ 完成" : "🔄 执行中"}
        </motion.span>
      </div>

      {/* Preview Area */}
      <div className={`bg-[#0a0f1a] h-72 relative overflow-hidden ${isCompleted ? "ring-2 ring-[#10b981]/30" : ""}`}>
        {screenshot ? (
          <img
            src={screenshot}
            alt="Browser Preview"
            className="w-full h-full object-contain"
          />
        ) : (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={!isCompleted ? { y: [0, -10, 0] } : {}}
            transition={{ duration: 2, repeat: isCompleted ? 0 : Infinity }}
          >
            <div className="text-center">
              {isCompleted ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-6xl mb-4"
                  >
                    ✅
                  </motion.div>
                  <p className="text-[#10b981] font-medium text-lg">
                    筛选完成!
                  </p>
                  <motion.p
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-[#64748b] text-sm mt-2"
                  >
                    点击查看筛选结果
                  </motion.p>
                </motion.div>
              ) : (
                <>
                  <motion.div
                    animate={{ rotate: isCompleted ? 360 : 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-6xl mb-4"
                  >
                    🕷️
                  </motion.div>
                  <p className="text-[#94a3b8] font-medium">
                    {steps.find(s => s.key === currentStep)?.label || currentStep}
                  </p>
                  <p className="text-[#64748b] text-sm mt-2">
                    {steps.find(s => s.key === currentStep)?.description || ""}
                  </p>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* Progress Indicator */}
        {!isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-4 left-4 right-4"
          >
            <div className="bg-[#1f2937]/90 backdrop-blur-xl rounded-xl p-4 shadow-xl border border-[#334155]">
              <div className="flex justify-between mb-3">
                {steps.slice(1, -1).map((step, index) => (
                  <motion.div
                    key={step.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: index <= currentIndex - 1 ? 1 : 0.4, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.15 }}
                    className="flex flex-col items-center cursor-default"
                  >
                    <span className="text-lg">{step.icon}</span>
                    <span className="text-xs mt-1 text-[#94a3b8]">{step.label}</span>
                  </motion.div>
                ))}
              </div>
              <div className="h-1.5 bg-[#334155] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentIndex) / (steps.length - 2)) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-[#0891b2] to-[#22d3ee] rounded-full shadow-lg shadow-[#0891b2]/50"
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Status Bar */}
      <motion.div
        whileHover={{ backgroundColor: "rgba(31, 41, 55, 1)" }}
        className="bg-[#1f2937] px-4 py-3 border-t border-[#334155]"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className={`w-2.5 h-2.5 rounded-full ${
                isCompleted ? "bg-[#10b981]" : "bg-[#f59e0b]"
              }`}
            />
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="text-sm text-[#94a3b8] cursor-default"
            >
              {isCompleted ? "任务已完成" : "处理中..."}
            </motion.span>
          </div>
          <motion.span
            whileHover={{ scale: 1.1, color: "#22d3ee" }}
            className="text-xs text-[#64748b] cursor-default"
          >
            Spider v1.34.2
          </motion.span>
        </div>
      </motion.div>
    </motion.div>
  );
}
