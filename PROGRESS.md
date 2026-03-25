# Spider 垂直浏览器Agent - 进度记录

## 项目状态

**当前阶段**: 核心功能已实现 + HR专业功能迭代
**开始日期**: 2026-03-24
**首次提交**: 2026-03-25
**当前版本**: v1.2.0 (2026-03-25)

---

## 项目概述

**Spider** 是一个垂直场景的浏览器自动化 Agent，专注于简历筛选场景。

核心功能：
1. JD解析 - 从招聘JD提取关键要求
2. 简历解析 - 从简历文本提取关键信息
3. 匹配评分 - 智能计算JD与简历的匹配度
4. 报告生成 - 输出结构化筛选报告

### 竞争力分析 (vs browser-use)

| 维度 | browser-use | Spider |
|------|-------------|--------|
| 定位 | 通用框架 | 垂直 SaaS (HR) |
| 用户 | 开发者 | HR |
| 核心能力 | 浏览器自动化 | 自动化 + HR垂直理解 |
| 交互 | API/代码 | 可视化界面 |
| HR专用 | 无 | JD解析、简历解析、智能匹配、候选人管理 |

**Spider = browser-use所有功能 + HR垂直场景特化**

## 匹配评分算法

| 维度 | 权重 |
|------|------|
| 硬性条件 | 30% |
| 技能匹配 | 30% |
| 行业经验 | 20% |
| 发展潜力 | 20% |

**评分等级**：
- ⭐ 强烈推荐：≥ 80分
- 🟡 可备选：60-79分
- ❌ 不通过：< 60分

---

## 已实现

### 核心 Agent

| 模块 | 文件 | 状态 |
|------|------|------|
| 类型定义 | `backend/agents/types.py` | ✅ 完成 |
| JD解析 | `backend/agents/jd_parser.py` | ✅ 完成 |
| 简历解析 | `backend/agents/resume_parser.py` | ✅ 完成 |
| 匹配评分 | `backend/agents/matcher.py` | ✅ 完成 |
| 报告生成 | `backend/agents/report_generator.py` | ✅ 完成 |
| 浏览器控制 | `backend/agents/browser_controller.py` | ⚠️ Stub |
| 竞品监控 | `backend/agents/competitor_monitor.py` | ⚠️ 框架 |
| LLM工具 | `backend/agents/llm_utils.py` | ⚠️ Stub |

### 流程编排

| 模块 | 文件 | 状态 |
|------|------|------|
| 筛选Graph | `backend/graph/screening_graph.py` | ✅ 完成 |

### 配置文件

| 模块 | 文件 | 状态 |
|------|------|------|
| 主配置 | `backend/config.py` | ✅ 完成 |
| 日志配置 | `backend/logging_config.py` | ✅ 完成 |

### 测试

| 测试 | 文件 | 状态 |
|------|------|------|
| JD解析测试 | `backend/tests/test_jd_parser.py` | ✅ 完成 |
| 简历解析测试 | `backend/tests/test_resume_parser.py` | ✅ 完成 |
| 匹配评分测试 | `backend/tests/test_matcher.py` | ✅ 完成 |
| 报告生成测试 | `backend/tests/test_report_generator.py` | ✅ 完成 |

---

## 待实现

### P0 - 核心框架

| 功能 | 优先级 | 说明 |
|------|--------|------|
| 浏览器控制集成 | P0 | 集成 browser-use/Playwright |
| API端点完善 | P0 | screening, history, competitor API ✅ |

### P1 - 功能增强

| 功能 | 优先级 | 说明 |
|------|--------|------|
| 前端页面 | P1 | Next.js 页面开发 |
| 实时预览 | P1 | 浏览器实时预览 |
| 多格式简历支持 | P1 | PDF/Word/图片 |
| 批量处理 | P1 | 多Tab管理 |

### P2 - 高级功能

| 功能 | 优先级 | 说明 |
|------|--------|------|
| 竞品监控完善 | P2 | 定时任务、数据采集 |
| 多LLM支持 | P2 | OpenAI/Anthropic |
| 记忆系统 | P2 | 工作流持久化 |

---

## 本次迭代改进 (v1.2 - 2026-03-25)

### HR专业功能

| 功能 | 状态 | 说明 |
|------|------|------|
| 招聘漏斗可视化 | ✅ | PipelineFunnel组件，状态流转追踪 |
| 候选人横向对比 | ✅ | CandidateComparison组件，2-4人对比 |
| 视图模式切换 | ✅ | 列表/漏斗/对比三种视图 |

### 已实现功能清单

| 功能 | 状态 | 版本 |
|------|------|------|
| 候选人详情Modal | ✅ | v1.1 |
| 候选人状态管理 | ✅ | v1.1 |
| 候选人备注 | ✅ | v1.1 |
| 候选人导出 | ✅ | v1.1 |
| 筛选结果导出 | ✅ | v1.1 |
| BrowserPreview增强 | ✅ | v1.1 |
| 招聘漏斗可视化 | ✅ | v1.2 |
| 候选人对比 | ✅ | v1.2 |
| 视图切换 | ✅ | v1.2 |

### 待实现功能

| 功能 | 优先级 | 说明 |
|------|--------|------|
| JD对比功能 | P2 | 多JD横向比较 |
| ATS集成导出 | P2 | 对接招聘系统 |
| 多格式简历支持 | P1 | PDF/Word/图片解析 |
| 笔记协作 | P3 | 候选人备注同步 |

---

## 本次迭代改进 (v1.1 - 2026-03-25)

### 前端增强

| 功能 | 状态 | 说明 |
|------|------|------|
| 候选人详情Modal | ✅ | 点击候选人可查看完整匹配分析 |
| 候选人状态管理 | ✅ | 支持待沟通/面试中/Offer/淘汰状态 |
| 候选人备注 | ✅ | 可添加HR评估备注 |
| 候选人导出 | ✅ | 单个候选人可导出JSON |
| 筛选结果导出 | ✅ | 支持JSON和CSV格式导出 |
| BrowserPreview增强 | ✅ | 步骤详细描述显示 |

### 组件清理

| 操作 | 说明 |
|------|------|
| 删除143个shadcn/ui通用组件 | 保留5个核心业务组件 |
| 清理CHANGELOG | 移除过时的UI组件声明 |
| Toast移至providers | 通用组件归并到基础设施 |

### 产品思考

基于HR Skills (pm-agent-forge/skills/hr/) 分析:

**当前Gap**:
1. 候选人详情Modal - ✅ 已实现
2. 筛选标准说明 - ✅ 已在Modal中显示
3. 候选人状态流转 - ✅ 已实现
4. 导出功能 - ✅ 已实现JSON/CSV
5. Pipeline漏斗 - ✅ v1.2已实现
6. 候选人对比 - ✅ v1.2已实现

**下一步可增强**:
- JD对比功能 (多JD横向比较)
- ATS集成导出
- 候选人笔记协作

### 技术笔记

- 前端使用Next.js 14 + Framer Motion动画
- 所有UI组件保持self-contained (不依赖外部复制组件)
- Toast作为通用utility放在providers/而非components/
- MatchResult使用AnimatePresence实现Modal动画
- PipelineFunnel新增漏斗可视化组件
- CandidateComparison新增候选人对比组件

---

## 技术栈

- **后端**: Python, FastAPI, LangGraph, Pydantic
- **前端**: Next.js 15, React 19, TypeScript, Tailwind CSS v4
- **浏览器控制**: Playwright, browser-use
- **配色**: 科技蓝 #0891B2 + 深灰 #374151

## 端口配置

- API: http://localhost:8004
- 前端: http://localhost:3777
- API文档: http://localhost:8004/docs

---

*进度记录 | Spider | 2026-03-25*
