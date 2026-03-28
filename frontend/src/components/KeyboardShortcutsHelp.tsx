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
      <motion.button
        whileHover={{ scale: 1.1, boxShadow: "0 0 20px rgba(34, 211, 238, 0.4)" }}
        whileTap={{ scale: 0.95 }}
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
      </motion.button>

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
                <motion.h3 whileHover={{ scale: 1.02 }} className="text-lg font-semibold text-white flex items-center gap-2 cursor-default">
                  <span>⌨️</span> 键盘快捷键
                </motion.h3>
                <motion.button
                  whileHover={{ scale: 1.2, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </motion.button>
              </div>

              <div className="space-y-3">
                {shortcuts.map((shortcut) => (
                  <motion.div
                    key={shortcut.key}
                    whileHover={{ x: 4, backgroundColor: "rgba(55, 65, 81, 0.3)" }}
                    className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0 cursor-pointer rounded px-2 -mx-2"
                  >
                    <motion.span whileHover={{ scale: 1.05 }} className="text-gray-400 text-sm cursor-default">{shortcut.description}</motion.span>
                    <motion.kbd
                      whileHover={{ scale: 1.1, borderColor: "rgba(34, 211, 238, 0.5)" }}
                      className="px-2 py-1 bg-[#111827] border border-gray-600 rounded text-xs text-gray-300 font-mono"
                    >
                      {shortcut.key}
                    </motion.kbd>
                  </motion.div>
                ))}
              </div>

              <motion.p whileHover={{ scale: 1.02 }} className="text-xs text-gray-500 mt-4 text-center cursor-default">
                在输入框外按下快捷键即可触发
              </motion.p>
              <div className="mt-3 pt-3 border-t border-gray-700 text-center">
                <motion.span whileHover={{ scale: 1.05 }} className="text-xs text-gray-600 cursor-default">Spider v1.34.2</motion.span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
