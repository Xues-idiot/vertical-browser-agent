"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

/* ============================================
   KEYBOARDSHORTCUTSHELP COMPONENT
   ============================================

   Design System Applied:
   - Modal: Glass effect backdrop
   - Primary Color: Cyan (#0891B2)
   - Kbd: Monospace font, subtle borders
   - Motion: Scale in/out, hover effects
   ============================================ */

interface Shortcut {
  key: string;
  description: string;
}

const shortcuts: Shortcut[] = [
  { key: "Ctrl/Cmd + 1", description: "列表视图" },
  { key: "Ctrl/Cmd + 2", description: "漏斗视图" },
  { key: "Ctrl/Cmd + 3", description: "对比视图" },
  { key: "Ctrl/Cmd + D", description: "JD对比" },
  { key: "R", description: "重置筛选" },
  { key: "Esc", description: "关闭弹窗" },
];

export default function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1, boxShadow: "0 0 25px rgba(6, 182, 212, 0.5)" }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#1f2937] border border-[#334155] rounded-full flex items-center justify-center text-[#94a3b8] hover:text-white hover:border-[#475569] transition-all z-50 shadow-xl"
        title="键盘快捷键"
      >
        <span className="text-xl">⌨️</span>
        <motion.span
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-1 -right-1 w-6 h-6 bg-[#0891b2] text-white text-xs rounded-full flex items-center justify-center font-medium shadow-lg"
        >
          {shortcuts.length}
        </motion.span>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-[#1f2937] rounded-2xl border border-[#334155] p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <motion.h3
                  whileHover={{ scale: 1.02 }}
                  className="text-lg font-display font-semibold text-[#f8fafc] flex items-center gap-2 cursor-default"
                >
                  <span>⌨️</span> 键盘快捷键
                </motion.h3>
                <motion.button
                  whileHover={{ scale: 1.2, rotate: 90, backgroundColor: "rgba(239, 68, 68, 0.2)" }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94a3b8] hover:text-[#ef4444] transition-colors"
                >
                  ✕
                </motion.button>
              </div>

              {/* Shortcuts List */}
              <div className="space-y-2">
                {shortcuts.map((shortcut) => (
                  <motion.div
                    key={shortcut.key}
                    whileHover={{ x: 4, backgroundColor: "rgba(51, 65, 85, 0.5)" }}
                    className="flex items-center justify-between py-3 px-3 border-b border-[#334155]/50 last:border-0 rounded-lg cursor-default"
                  >
                    <motion.span
                      whileHover={{ scale: 1.02 }}
                      className="text-[#94a3b8] text-sm cursor-default"
                    >
                      {shortcut.description}
                    </motion.span>
                    <motion.kbd
                      whileHover={{ scale: 1.1, borderColor: "rgba(34, 211, 238, 0.5)", boxShadow: "0 0 10px rgba(6, 182, 212, 0.3)" }}
                      className="px-3 py-1.5 bg-[#0a0f1a] border border-[#475569] rounded-lg text-xs text-[#f8fafc] font-mono shadow-inner"
                    >
                      {shortcut.key}
                    </motion.kbd>
                  </motion.div>
                ))}
              </div>

              {/* Footer Hint */}
              <motion.p
                whileHover={{ scale: 1.02 }}
                className="text-xs text-[#64748b] mt-6 text-center cursor-default"
              >
                在输入框外按下快捷键即可触发
              </motion.p>

              {/* Version */}
              <div className="mt-4 pt-4 border-t border-[#334155] text-center">
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="text-xs text-[#475569] cursor-default font-medium"
                >
                  Spider v1.34.2
                </motion.span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
