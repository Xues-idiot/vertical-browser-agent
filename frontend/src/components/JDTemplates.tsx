"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface JDPromptTemplate {
  id: string;
  name: string;
  prompt: string;
  createdAt: string;
}

interface JDTemplatesProps {
  onSelect: (prompt: string) => void;
  onClose: () => void;
}

const defaultTemplates: JDPromptTemplate[] = [
  {
    id: "1",
    name: "高级产品经理",
    prompt: "招聘高级产品经理，要求：\n1. 5年以上产品经验\n2. 有SaaS或B2B产品经验\n3. 本科985/211优先\n4. 有团队管理经验",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "前端工程师",
    prompt: "招聘前端工程师，要求：\n1. 3年以上React/Vue经验\n2. 熟悉TypeScript\n3. 有良好的代码规范\n4. 本科以上学历",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "数据分析师",
    prompt: "招聘数据分析师，要求：\n1. 统计学或计算机背景\n2. 熟练使用Python/SQL\n3. 有数据可视化经验\n4. 本科以上学历",
    createdAt: new Date().toISOString(),
  },
];

export default function JDTemplates({ onSelect, onClose }: JDTemplatesProps) {
  const [templates, setTemplates] = useState<JDPromptTemplate[]>(() => {
    const saved = localStorage.getItem("jd-templates");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultTemplates;
      }
    }
    return defaultTemplates;
  });
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplatePrompt, setNewTemplatePrompt] = useState("");
  const [showForm, setShowForm] = useState(false);

  const saveTemplate = () => {
    if (!newTemplateName.trim() || !newTemplatePrompt.trim()) return;

    const newTemplate: JDPromptTemplate = {
      id: Date.now().toString(),
      name: newTemplateName.trim(),
      prompt: newTemplatePrompt.trim(),
      createdAt: new Date().toISOString(),
    };

    const updated = [newTemplate, ...templates];
    setTemplates(updated);
    localStorage.setItem("jd-templates", JSON.stringify(updated));
    setNewTemplateName("");
    setNewTemplatePrompt("");
    setShowForm(false);
  };

  const deleteTemplate = (id: string) => {
    const updated = templates.filter(t => t.id !== id);
    setTemplates(updated);
    localStorage.setItem("jd-templates", JSON.stringify(updated));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#1F2937] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">JD模板库</h2>
            <p className="text-purple-100 text-sm mt-1">保存和复用招聘需求模板</p>
          </div>
          <button onClick={onClose} className="text-purple-100 hover:text-white transition-colors">
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          {/* Template List */}
          <div className="space-y-3 mb-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-[#111827] rounded-lg p-4 border border-gray-700 hover:border-purple-500/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-white mb-2">{template.name}</h4>
                    <p className="text-xs text-gray-400 whitespace-pre-wrap line-clamp-3">
                      {template.prompt}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        onSelect(template.prompt);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-600/30 transition-colors text-sm"
                    >
                      使用
                    </button>
                    <button
                      onClick={() => deleteTemplate(template.id)}
                      className="px-3 py-1.5 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-600/30 transition-colors text-sm"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Template */}
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-3 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-purple-500 hover:text-purple-400 transition-colors flex items-center justify-center gap-2"
            >
              <span>+</span> 添加新模板
            </button>
          ) : (
            <div className="bg-[#111827] rounded-lg p-4 border border-purple-500/30">
              <h4 className="font-medium text-white mb-3">新建模板</h4>
              <input
                type="text"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="模板名称，如：高级前端工程师"
                className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500 mb-3"
              />
              <textarea
                value={newTemplatePrompt}
                onChange={(e) => setNewTemplatePrompt(e.target.value)}
                placeholder="招聘要求描述..."
                className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500 mb-3"
                rows={4}
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  取消
                </button>
                <button
                  onClick={saveTemplate}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  保存模板
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
