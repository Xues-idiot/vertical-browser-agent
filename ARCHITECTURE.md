# Spider (垂直浏览器Agent) - 架构文档

> ⚠️ **产品定位**：垂直于 HR 招聘场景的智能筛选工具
> ⚠️ **核心竞争力**：理解简历内容 + JD要求 + 智能匹配 + 候选人管理
> ⚠️ **不是**：通用浏览器自动化框架（那是 browser-use）

---

## 产品定位

### 目标用户
- HR（人力资源专员、招聘经理）
- 需要快速从大量简历中筛选合适候选人

### 核心痛点
1. 读简历费时间（100份简历 = 3小时）
2. JD 要求和简历不匹配看不出来
3. 筛选结果难管理（待沟通/面试中/offer/淘汰）

### 解决方案
- 输入：JD + 简历列表（一句话说不清楚的复杂场景）
- 输出：按匹配度排序的候选人列表 + 筛选报告

### vs browser-use（源项目）
| 维度 | browser-use | Spider |
|------|-------------|--------|
| 定位 | 通用框架 | 垂直 SaaS |
| 用户 | 开发者 | HR |
| 核心能力 | 浏览器自动化 | **自动化 + HR 垂直理解** |
| 交互 | API / 代码 | 可视化界面 |
| HR 专用 | 无 | JD解析、简历解析、智能匹配、候选人管理 |

**Spider = browser-use 所有功能 + HR 垂直场景特化**

---

## 架构分层

```
┌─────────────────────────────────────────────┐
│           可视化界面 (Frontend)               │
├─────────────────────────────────────────────┤
│  候选人管理 │ 报告生成 │ 筛选工作流            │  ← HR 垂直功能
├─────────────────────────────────────────────┤
│  JD解析 │ 简历解析 │ 智能匹配                │  ← 核心算法
├─────────────────────────────────────────────┤
│        browser-controller (浏览器自动化)       │  ← 底层能力 from browser-use
└─────────────────────────────────────────────┘
```

---

## 扩展性设计

Spider 不仅限于 HR 招聘筛选，架构支持扩展到其他垂直场景：

```
Spider (垂直浏览器Agent)
├── 当前：HR 招聘筛选
├── 潜在：法务合同审查
├── 潜在：金融报告分析
├── 潜在：房产信息采集
└── ...
```

### 扩展机制

| 模块 | 扩展方式 |
|------|---------|
| browser-controller | 通用能力，直接复用 |
| jd-parser | 新增场景 parser（如合同 parser） |
| resume-parser | 新增场景 parser（如报告 parser） |
| matcher | 新增匹配策略（如合同匹配策略） |
| report-generator | 新增报告模板 |

### 扩展示例

新增"法律合同审查"场景：
1. 复用 `browser-controller` 采集合同 PDF
2. 新增 `contract-parser` 解析合同内容
3. 新增 `contract-matcher` 匹配法规条款
4. 新增 `contract-report-generator` 生成审查报告

---

## 核心竞争力模块

### 1. resume-parser（简历解析）
**核心地位**：HR 收到的是 PDF/DOCX 文件，不是纯文本。这是入口功能。

### 2. jd-parser（JD 解析）
从 JD 中提取：岗位要求、技能要求、工作经验要求、学历要求

### 3. matcher（智能匹配）
核心算法：JD 要求 vs 简历内容 → 匹配度评分

### 4. report-generator（报告生成）
输出结构化筛选报告，支持导出

### 5. 候选人管理（候选人状态流转）
- 待沟通 → 面试中 → offer → 入职 / 淘汰

### 6. browser-controller（浏览器自动化）
**核心底层能力**：支撑所有 HR 垂直场景
- 从招聘网站抓取 JD
- 从 LinkedIn/招聘平台抓取候选人信息
- 竞品职位采集
- **不是"非核心"，是让一切成为可能的基础设施**

---

## browser-controller 模块

### 类型
- `BrowserSession` - 浏览器会话
- `BrowserAction` - 浏览器动作

### 函数
- `init_browser() -> BrowserSession` 初始化浏览器
- `execute_action(session: BrowserSession, action: BrowserAction) -> Result` 执行动作
- `take_screenshot(session: BrowserSession) -> Image` 截图

### 测试
- should launch browser successfully
- should handle navigation errors

---

## jd-parser 模块

### 类型
- `JDText` - JD原始文本
- `JDInfo` - JD解析结果

### 函数
- `parse_jd(jd_text: JDText) -> JDInfo` 解析JD要求
- `extract_requirements(jd: JDInfo) -> Requirements` 提取具体要求

### 测试
- should extract experience requirements
- should extract skill requirements

---

## resume-parser 模块

### 类型
- `ResumeText` - 简历文本
- `ResumeInfo` - 简历解析结果

### 函数
- `parse_resume(resume_text: ResumeText) -> ResumeInfo` 解析简历
- `extract_experience(resume: ResumeInfo) -> Experience` 提取经验信息

### 测试
- should extract candidate name
- should extract work experience

---

## matcher 模块

### 类型
- `MatchScore` - 匹配分数
- `MatchResult` - 匹配结果

### 函数
- `calculate_score(jd: JDInfo, resume: ResumeInfo) -> MatchScore` 计算匹配度
- `rank_candidates(scores: list[MatchScore]) -> list[MatchResult]` 候选人排序

### 测试
- should score based on experience
- should score based on skills
- should handle missing information gracefully

---

## screening-graph 模块

### 类型
- `ScreeningState` - 筛选状态

### 函数
- `create_screening_graph() -> StateGraph` 创建筛选图
- `run_screening(jd_url: str, resume_list: list) -> ScreeningReport` 运行筛选

### 测试
- should process all resumes
- should generate ranked results

---

## report-generator 模块

### 类型
- `ScreeningReport` - 筛选报告
- `CandidateRecommendation` - 候选人推荐

### 函数
- `generate_report(results: list[MatchResult]) -> ScreeningReport` 生成报告
- `format_recommendation(candidate: ResumeInfo, score: MatchScore) -> CandidateRecommendation` 格式化推荐

### 测试
- should include strong recommendations
- should include backup recommendations
- should show screening criteria

---

*架构文档 | Spider | 2026-03-24*