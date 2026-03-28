"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

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
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 w-12 h-12 bg-[#1F2937] border border-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-600 transition-colors z-40 shadow-lg"
        title="键盘快捷键"
      >
        <span className="text-lg">⌨️</span>
        <motion.span
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-600 text-white text-xs rounded-full flex items-center justify-center font-medium"
        >
          {shortcuts.length}
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1F2937] rounded-xl border border-gray-700 p-6 max-w-md w-full mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span>⌨️</span> 键盘快捷键
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                {shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.key}
                    className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0"
                  >
                    <span className="text-gray-400 text-sm">{shortcut.description}</span>
                    <kbd className="px-2 py-1 bg-[#111827] border border-gray-600 rounded text-xs text-gray-300 font-mono">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-500 mt-4 text-center">
                在输入框外按下快捷键即可触发
              </p>
              <div className="mt-3 pt-3 border-t border-gray-700 text-center">
                <span className="text-xs text-gray-600">Spider v1.34.2</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
