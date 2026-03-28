"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { historyAPI, HistoryReport } from "@/lib/api";

/* ============================================
   HISTORY PAGE
   ============================================

   Design System Applied:
   - Card: Dark elevated surface
   - Colors: Cyan (#0891B2), Amber (#f59e0b), Emerald (#10b981), Purple (#7c3aed)
   - Background: #0a0f1a
   - Motion: Scale on hover, staggered animations
   ============================================ */

interface HistoryItem {
  id: string;
  position_name: string;
  jd_source: string;
  total_resumes: number;
  screened_resumes: number;
  strong_count: number;
  backup_count: number;
  rejected_count: number;
  screening_criteria: string[];
  generated_at: string;
  status: "completed" | "failed" | "processing";
}

const mockHistory: HistoryReport[] = [
  {
    id: "1",
    position_name: "高级产品经理",
    jd_source: "https://linkedin.com/jobs/123",
    total_resumes: 15,
    screened_resumes: 8,
    strong_count: 3,
    backup_count: 5,
    rejected_count: 7,
    screening_criteria: ["经验≥3年", "本科以上", "有SaaS经验"],
    generated_at: "2026-03-24T10:30:00Z",
    status: "completed",
  },
  {
    id: "2",
    position_name: "资深前端工程师",
    jd_source: "https://boss.com/jobs/456",
    total_resumes: 20,
    screened_resumes: 12,
    strong_count: 5,
    backup_count: 7,
    rejected_count: 8,
    screening_criteria: ["React专家", "5年+经验", "TypeScript"],
    generated_at: "2026-03-23T15:20:00Z",
    status: "completed",
  },
  {
    id: "3",
    position_name: "数据分析师",
    jd_source: "https://zhilian.com/job/789",
    total_resumes: 10,
    screened_resumes: 0,
    strong_count: 0,
    backup_count: 0,
    rejected_count: 0,
    screening_criteria: ["Python", "SQL", "数据分析"],
    generated_at: "2026-03-22T09:15:00Z",
    status: "failed",
  },
];

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}天前`;
  if (hours > 0) return `${hours}小时前`;
  return "刚刚";
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "completed" | "failed">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
    // loadHistory uses useCallback with empty deps, so it's stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await historyAPI.list();
      if (response.success && response.data?.reports) {
        setHistory(response.data.reports);
      } else {
        setHistory(mockHistory);
      }
    } catch {
      setHistory(mockHistory);
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredHistory = useMemo(() => history.filter((item) => {
    const matchesSearch =
      item.position_name.toLowerCase().includes(search.toLowerCase()) ||
      item.jd_source.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || item.status === filter;
    return matchesSearch && matchesFilter;
  }), [history, search, filter]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await historyAPI.delete(id);
    } catch {
      // Ignore delete error, still remove locally
    }
    setHistory((prevHistory) => prevHistory.filter((item) => item.id !== id));
  }, []);

  const handleExport = useCallback((item: HistoryReport) => {
    const data = JSON.stringify(item, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `screening-${item.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const getStatusBadge = useCallback((status?: string) => {
    const styles: Record<string, string> = {
      completed: "bg-[#10b981]/20 text-[#34d399] border-[#10b981]/30",
      failed: "bg-[#ef4444]/20 text-[#f87171] border-[#ef4444]/30",
      processing: "bg-[#f59e0b]/20 text-[#fbbf24] border-[#f59e0b]/30",
    };
    const labels: Record<string, string> = {
      completed: "已完成",
      failed: "失败",
      processing: "处理中",
    };
    const s = status || "processing";
    return (
      <motion.span
        whileHover={{ scale: 1.05 }}
        className={`px-2 py-0.5 text-xs rounded-full border ${styles[s] || styles.processing} transition-all hover:shadow-md cursor-default`}
      >
        {labels[s] || "处理中"}
      </motion.span>
    );
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-[#f8fafc]">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-[#1f2937]/80 backdrop-blur-sm border-b border-[#334155] sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 bg-gradient-to-br from-[#0891b2] to-[#0e7490] rounded-xl flex items-center justify-center text-xl shadow-lg shadow-[#0891b2]/20"
              >
                🕷️
              </motion.div>
              <div>
                <motion.h1 whileHover={{ scale: 1.05 }} className="text-xl font-bold text-[#f8fafc] cursor-default">Spider</motion.h1>
                <motion.p whileHover={{ scale: 1.05 }} className="text-xs text-[#64748b] cursor-default">筛选历史记录</motion.p>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2"
            >
              <span className="px-3 py-1 bg-[#0891b2]/20 text-[#22d3ee] text-xs font-medium rounded-full border border-[#0891b2]/30">
                v1.34.2
              </span>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search & Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            {/* Search */}
            <div className="relative max-w-md w-full">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索职位名称或JD来源..."
                className="w-full bg-[#1f2937] border border-[#334155] rounded-lg px-4 py-2 pl-10 text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:border-[#0891b2] focus:shadow-lg focus:shadow-[#0891b2]/20 transition-shadow"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Tabs */}
            <div className="flex bg-[#1f2937] rounded-lg p-1 border border-[#334155]">
              {[
                { value: "all", label: "全部" },
                { value: "completed", label: "已完成" },
                { value: "failed", label: "失败" },
              ].map((tab) => (
                <motion.button
                  key={tab.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilter(tab.value as typeof filter)}
                  className={`px-4 py-1.5 rounded-md text-sm transition-colors ${
                    filter === tab.value
                      ? "bg-[#0891b2] text-white"
                      : "text-[#94a3b8] hover:text-white"
                  }`}
                >
                  {tab.label}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* History List */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#1f2937] rounded-xl p-6 animate-pulse"
              >
                <div className="h-6 bg-[#334155] rounded w-1/4 mb-4" />
                <div className="h-4 bg-[#334155] rounded w-1/2 mb-2" />
                <div className="h-4 bg-[#334155] rounded w-1/3" />
              </motion.div>
            ))}
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-16">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-6xl mb-4 cursor-default"
            >
              📋
            </motion.div>
            <motion.h3 whileHover={{ scale: 1.05 }} className="text-xl font-semibold text-[#f8fafc] mb-2 cursor-default">暂无筛选记录</motion.h3>
            <motion.p whileHover={{ scale: 1.05 }} className="text-[#64748b] mb-6 cursor-default">开始你的第一次简历筛选吧</motion.p>
            <motion.a
              href="/"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0891b2] to-[#0e7490] text-white px-6 py-3 rounded-xl shadow-lg shadow-[#0891b2]/20 hover:from-[#0e7490] hover:to-[#0891b2] transition-all"
            >
              前往筛选
            </motion.a>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence>
              {filteredHistory.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  className="bg-[#1f2937] rounded-xl p-6 hover:bg-[#334155] transition-colors shadow-lg hover:shadow-xl border border-[#334155] hover:border-[#475569]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <motion.h3 whileHover={{ scale: 1.02 }} className="text-lg font-semibold text-[#f8fafc] cursor-default">
                          {item.position_name}
                        </motion.h3>
                        {getStatusBadge(item.status)}
                      </div>
                      <motion.p whileHover={{ scale: 1.02 }} className="text-[#64748b] text-sm mb-3 truncate cursor-default" title={item.jd_source || ""}>
                        来源: {item.jd_source ? (item.jd_source.length > 50 ? item.jd_source.slice(0, 50) + "..." : item.jd_source) : "无"}
                      </motion.p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <motion.span whileHover={{ scale: 1.05 }} className="text-[#64748b] cursor-default">
                          {formatDate(item.generated_at)}
                        </motion.span>
                        <motion.span whileHover={{ scale: 1.05 }} className="text-[#64748b] cursor-default">
                          简历: {item.total_resumes}份
                        </motion.span>
                        <motion.span whileHover={{ scale: 1.05 }} className="text-[#34d399] cursor-default">
                          推荐: {item.strong_count}份
                        </motion.span>
                        <motion.span whileHover={{ scale: 1.05 }} className="text-[#fbbf24] cursor-default">
                          备选: {item.backup_count}份
                        </motion.span>
                        <motion.span whileHover={{ scale: 1.05 }} className="text-[#f87171] cursor-default">
                          淘汰: {item.rejected_count}份
                        </motion.span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedId(item.id)}
                        className="p-2 text-[#64748b] hover:text-white hover:bg-[#334155] rounded-lg transition-colors"
                        title="查看"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleExport(item)}
                        className="p-2 text-[#64748b] hover:text-white hover:bg-[#334155] rounded-lg transition-colors"
                        title="导出"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigator.clipboard.writeText(item.jd_source)}
                        className="p-2 text-[#64748b] hover:text-[#22d3ee] hover:bg-[#334155] rounded-lg transition-colors"
                        title="复制JD链接"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-[#64748b] hover:text-[#ef4444] hover:bg-[#334155] rounded-lg transition-colors"
                        title="删除"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* 历史详情弹窗 */}
      <AnimatePresence>
        {selectedId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1f2937] rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden border border-[#334155]"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const item = history.find(h => h.id === selectedId);
                if (!item) return null;
                return (
                  <>
                    <div className="bg-gradient-to-r from-[#0891b2] to-[#0e7490] px-6 py-4 flex justify-between items-center">
                      <motion.h2
                        whileHover={{ scale: 1.02 }}
                        className="text-xl font-bold text-white cursor-default"
                      >
                        {item.position_name}
                      </motion.h2>
                      <motion.button
                        whileHover={{ scale: 1.2, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedId(null)}
                        className="text-[#a5f3fc] hover:text-white transition-colors"
                      >
                        ✕
                      </motion.button>
                    </div>
                    <div className="p-6 overflow-y-auto max-h-[60vh]">
                      <div className="space-y-4">
                        <motion.div whileHover={{ scale: 1.01 }} className="flex justify-between items-center p-3 bg-[#0a0f1a] rounded-lg cursor-default">
                          <span className="text-[#94a3b8]">状态</span>
                          {getStatusBadge(item.status)}
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.01 }} className="flex justify-between items-center p-3 bg-[#0a0f1a] rounded-lg cursor-default">
                          <span className="text-[#94a3b8]">简历总数</span>
                          <span className="text-[#f8fafc] font-medium">{item.total_resumes}份</span>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.01 }} className="flex justify-between items-center p-3 bg-[#0a0f1a] rounded-lg cursor-default">
                          <span className="text-[#94a3b8]">筛选通过</span>
                          <span className="text-[#34d399] font-medium">{item.screened_resumes}份</span>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.01 }} className="flex justify-between items-center p-3 bg-[#0a0f1a] rounded-lg cursor-default">
                          <span className="text-[#94a3b8]">强烈推荐</span>
                          <span className="text-[#34d399] font-medium">{item.strong_count}份</span>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.01 }} className="flex justify-between items-center p-3 bg-[#0a0f1a] rounded-lg cursor-default">
                          <span className="text-[#94a3b8]">可备选</span>
                          <span className="text-[#fbbf24] font-medium">{item.backup_count}份</span>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.01 }} className="flex justify-between items-center p-3 bg-[#0a0f1a] rounded-lg cursor-default">
                          <span className="text-[#94a3b8]">淘汰</span>
                          <span className="text-[#f87171] font-medium">{item.rejected_count}份</span>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.01 }} className="p-3 bg-[#0a0f1a] rounded-lg cursor-default">
                          <span className="text-[#64748b] text-sm">JD来源</span>
                          <p className="text-[#f8fafc] text-sm mt-1 truncate">{item.jd_source}</p>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.01 }} className="p-3 bg-[#0a0f1a] rounded-lg">
                          <span className="text-[#64748b] text-sm">筛选标准</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {(item.screening_criteria || []).map((c, i) => (
                              <motion.span
                                key={i}
                                whileHover={{ scale: 1.1 }}
                                className="bg-[#0891b2]/20 text-[#22d3ee] px-2 py-1 rounded-full text-xs border border-[#0891b2]/30 cursor-default"
                              >
                                {c}
                              </motion.span>
                            ))}
                          </div>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.01 }} className="p-3 bg-[#0a0f1a] rounded-lg cursor-default">
                          <span className="text-[#64748b] text-sm">生成时间</span>
                          <p className="text-[#f8fafc] text-sm mt-1">{new Date(item.generated_at).toLocaleString()}</p>
                        </motion.div>
                      </div>
                    </div>
                    <div className="bg-[#0a0f1a] px-6 py-4 border-t border-[#334155] flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleExport(item)}
                        className="flex-1 py-2 bg-[#0891b2]/20 text-[#22d3ee] border border-[#0891b2]/30 rounded-lg hover:bg-[#0891b2]/30 transition-colors text-sm"
                      >
                        导出JSON
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedId(null)}
                        className="flex-1 py-2 bg-[#64748b]/20 text-[#94a3b8] border border-[#64748b]/30 rounded-lg hover:bg-[#64748b]/30 transition-colors text-sm"
                      >
                        关闭
                      </motion.button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-[#1f2937]/50 border-t border-[#334155] mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center text-sm text-[#64748b]">
            <div className="flex items-center gap-4">
              <motion.span whileHover={{ scale: 1.05 }} className="cursor-default">Spider v1.34.2</motion.span>
              <span className="w-px h-4 bg-[#334155]" />
              <motion.span whileHover={{ scale: 1.05 }} className="cursor-default">垂直浏览器Agent</motion.span>
            </div>
            <div className="flex items-center gap-2">
              <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-2 h-2 bg-[#10b981] rounded-full" />
              <motion.span whileHover={{ scale: 1.05 }} className="cursor-default">系统运行正常</motion.span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}