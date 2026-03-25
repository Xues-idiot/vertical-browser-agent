# Spider (垂直浏览器Agent) - 初始指令

> 代号 Spider (蛛)，意为"像蜘蛛一样在网页上织网、捕获信息"

## 项目定位

**核心问题**：需要一个**垂直场景**的浏览器Agent，不是做另一个browser-use（通用自动化），而是专注于**特定场景的自动化**。

**解决方案**：做一个**垂直领域的浏览器Agent**，底层是浏览器自动化框架（参考browser-use），前端封装垂直场景（如简历筛选Agent）——自动浏览招聘网站、筛选简历、生成推荐报告。

> 定位：底层是**浏览器自动化框架** + 前端是**垂直场景应用**
> 扩展性：后续可以新增更多垂直场景（竞品监控、数据采集、内容抓取等）

**框架架构**：
```
browser-use 底层框架
       ↓
  垂直场景层
  ├── 简历筛选 Agent
  ├── 竞品监控 Agent
  └── 更多场景...
```

---

## 参考项目分析

### browser-use
**Stars**: 83k | **架构**: Python + LangChain + Playwright

**核心功能**:
- AI Agent控制浏览器
- 自动导航、点击、输入
- 支持自定义工具
- 支持Cloud/Local

**技术要点**:
```python
from browser_use import Agent, Browser

agent = Agent(
    task="Find the number of stars of the browser-use repo",
    llm=ChatBrowserUse(),
    browser=Browser(),
)
await agent.run()
```

**启发**:
- 完整的浏览器控制能力
- 任务拆解执行
- 视觉反馈

**我们的差异**:
- browser-use是**通用框架**
- 我们做**垂直场景**（简历筛选/竞品监控/数据采集）
- 更聚焦，更易用
- **国内市场特色**：猎聘/Boss直聘/领英中国、电商平台（淘宝/京东）竞品监控

**开源差异** (如果未来发布 GitHub)：
- 原项目 browser-use 是通用浏览器自动化框架
- 我们是**开箱即用的垂直场景产品**，不是技术框架
- 国内平台（猎聘、Boss直聘）是原生支持

---

## 核心功能设计

### 场景1: 简历筛选Agent
```
输入：JD链接 + 简历列表
输出：
┌─────────────────────────────────────────────────────┐
│ 📋 简历筛选报告 - Spider                            │
├─────────────────────────────────────────────────────┤
│ 岗位: 高级产品经理                                   │
│ JD来源: 某聘平台                                     │
│ 收到简历: 156份 → 筛选后: 23份                      │
├─────────────────────────────────────────────────────┤
│ ⭐ 强烈推荐 (5份):                                  │
│                                                    │
│ 1. 张三 (8年经验) - 匹配度 92%                      │
│    ✓ 做过电商、Saas产品                             │
│    ✓ 知名互联网公司背景                              │
│    → [查看简历] [预约面试]                          │
│                                                    │
│ 2. 李四 (5年经验) - 匹配度 88%                     │
│    ...                                             │
├─────────────────────────────────────────────────────┤
│ 🟡 可备选 (18份):                                   │
│ ...                                                 │
├─────────────────────────────────────────────────────┤
│ 💡 筛选标准:                                        │
│ • 经验年限 ≥ 3年                                    │
│ • 有电商/SaaS经验                                    │
│ • 学历本科以上                                       │
└─────────────────────────────────────────────────────┘
```

### 场景2: 竞品数据采集Agent
```
输入：竞品列表
输出：
┌─────────────────────────────────────────────────────┐
│ 🔍 竞品数据采集 - Spider                            │
├─────────────────────────────────────────────────────┤
│ 监控竞品: 竞品A、竞品B、竞品C                       │
│ 采集时间: 2026-03-24 10:00                        │
├─────────────────────────────────────────────────────┤
│ 📊 竞品A:                                           │
│ • 价格: ¥299/月 → 更新: 今天                        │
│ • 月活用户: 10万 → 较上月: +5%                    │
│ • AppStore排名: #23 → 较上周: ↑12名              │
│ • 新功能: [新功能名称]                             │
├─────────────────────────────────────────────────────┤
│ 📊 竞品B:                                           │
│ ...                                                 │
└─────────────────────────────────────────────────────┘
```

### 工作流程（简历筛选为例）
```
输入JD链接 + 简历列表
       ↓
┌─────────────────────────────────┐
│  浏览器控制Agent                 │ ← 打开招聘网站
└─────────────────────────────────┘
       ↓
┌─────────────────────────────────┐
│  JD解析Agent                    │ ← 提取JD要求
└─────────────────────────────────┘
       ↓
┌─────────────────────────────────┐
│  简历解析Agent                  │ ← 逐个打开简历
└─────────────────────────────────┘
       ↓
┌─────────────────────────────────┐
│  匹配评分Agent                   │ ← 对比JD与简历
└─────────────────────────────────┘
       ↓
┌─────────────────────────────────┐
│  报告生成Agent                  │ ← 生成推荐报告
└─────────────────────────────────┘
```

---

## 技术架构

### 后端
```
backend/
├── agents/
│   ├── browser_controller.py   # 浏览器控制
│   ├── jd_parser.py           # JD解析
│   ├── resume_parser.py        # 简历解析
│   ├── matcher.py             # 匹配评分
│   └── report_generator.py    # 报告生成
├── tools/
│   ├── browser.py             # 浏览器操作
│   ├── navigation.py          # 网站导航
│   └── screenshot.py           # 截图
├── graph/
│   └── screening_graph.py     # LangGraph编排
└── api/
    └── screening.py            # API接口
```

### 前端
```
frontend/
├── src/
│   ├── app/
│   │   └── screening/
│   │       └── page.tsx    # 筛选页面
│   ├── components/
│   │   ├── JDInput.tsx      # JD输入
│   │   ├── ResumeList.tsx   # 简历列表
│   │   ├── MatchResult.tsx  # 匹配结果
│   │   ├── BrowserPreview.tsx # 浏览器预览
│   │   ├── ReportView.tsx   # 报告查看
│   │   └── ui/              # shadcn/ui 组件
│   ├── lib/
│   │   ├── api.ts           # API 调用
│   │   └── utils.ts         # 工具函数
│   └── store/
│       └── screening-store.ts # Zustand 状态管理
```

**前端设计规范** ⚠️ 必须遵循，避免 AI 死板风格：

1. **动画优先**
   - 必须使用 `motion` (Framer Motion) 做动画
   - 禁止出现"死板"、没有过渡效果的 UI
   - 简历卡片、匹配结果、报告切换都要有动画
   - 参考：https://motion.dev/

2. **配色方案**
   - ❌ 禁止用默认的 AI 蓝/紫色（#007AFF, #6366F1 等）
   - ✅ 使用成熟的配色方案，如：
     - 专业HR感：深灰 + 绿色/橙色区分通过/待定
     - 数据看板感：深色背景 + 高对比度
   - 参考 shadcn/ui 的默认配色，但可自定义
   - 配色工具：https://ui.shadcn.com/themes
   - MVP阶段：shadcn/ui `zinc` 或 `slate` 主题（专业中性灰）
   - 后续可调整：数据看板感（深色+高对比度）、中国古典色

3. **字体选择**
   - ✅ 使用 Inter 或其他成熟无衬线字体
   - ❌ 禁止用系统默认中文字体
   - 字体平台：Google Fonts

4. **技术栈**
   - Next.js 15 + React 19 + TypeScript
   - Tailwind CSS v4 + shadcn/ui
   - Zustand 状态管理
   - SSE 流式输出（用于浏览器实时预览）
   - Motion 动画

5. **组件规范**
   - 优先使用 shadcn/ui 组件
   - 组件要有 hover、focus、active 状态
   - 简历卡片要有悬浮效果
   - 匹配分数要有进度条动画

6. **设计参考**
   - https://v0.dev/ - Vercel AI UI 参考
   - https://ui.shadcn.com/ - shadcn/ui 组件库
   - https://motion.dev/ - 动画库

---

## 技术要点
│   │   ├── ReportView.tsx   # 报告查看
│   │   └── BrowserPreview.tsx # 浏览器预览
```

---

## 技术要点

### 1. 浏览器控制
```python
# 基于browser-use
from browser_use import Agent, Browser

agent = Agent(
    task=f"""
    1. 打开 {jd_url}
    2. 提取JD中的岗位要求
    3. 打开简历列表页
    4. 逐个查看简历
    5. 记录每个候选人的关键信息
    """,
    llm=ChatBrowserUse(),
    browser=Browser(),
)
```

### 2. JD/简历解析
```python
# 用LLM提取关键信息
jd_info = llm.invoke(f"""
从以下JD中提取关键要求：
{jd_text}

格式：
经验要求：[X年]
学历要求：[本科/硕士]
技能要求：[技能1, 技能2, ...]
行业要求：[电商/SaaS/...]
""")
```

### 3. 匹配评分
```python
# 计算匹配度
score = 0
if jd.经验要求 <= resume.经验年限:
    score += 30
if any(skill in resume.技能 for skill in jd.技能要求):
    score += 40
# ... 其他维度
```

---

## 服务配置

### 端口配置
```
前端: http://localhost:3777
后端API: http://localhost:8004/docs
```

### 配色方案（垂直浏览器项目特色）
- **主色**: 科技蓝 `#0891B2`（科技、专业）
- **辅色**: 深灰 `#374151`（沉稳、结构）
- **点缀色**: 绿色 `#10B981`（通过、成功）/ 橙色 `#F59E0B`（待定、警告）
- **背景**: 深色 `#111827`（数据看板感、高对比度）
- MVP阶段: shadcn/ui `slate` 主题 + 上述配色点缀

### 学习参考
- **现有项目**: `pm-assistant/` (Pi) - 学习端口配置、预测系统架构
- **现有项目**: `private-operation-agent/` (Nu) - 学习工作流设计
- **参考项目**: `browser-use/` - 浏览器自动化架构

---

## 参考资料

```
_reference/
└── browser-use/      # 浏览器自动化参考
    ├── browser_use/
    ├── examples/
    ├── skills/
    └── README.md
```

---

## 配置信息

### 环境变量 (.env)
```
MINIMAX_API_KEY=your_minimax_api_key_here
MINIMAX_BASE_URL=https://api.minimaxi.com/anthropic
MINIMAX_MODEL=MiniMax-M2.7
TAVILY_API_KEY=your_tavily_api_key_here
GITHUB_TOKEN=your_github_token_here
```

### Sigma Skills 参考
```
D:/PM-AI-Workstation/01-ai-agents/pm-agent-forge/skills/
├── automation/                  # 自动化相关Skills
│   └── browser-automation/
├── hr/                          # HR相关Skills
│   ├── resume-screening/
│   └── job-description-writing/
└── common/
    └── critical-thinking/    # 批判性思维
```

---

## 初始任务

1. 理解browser-use的架构
2. 实现一个垂直场景（简历筛选）
3. 实现浏览器控制流程
4. 实现匹配评分算法
5. 添加前端UI（实时预览）

---

*代号: Spider (蛛) | 2026-03-24*
