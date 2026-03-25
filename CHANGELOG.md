# Spider - 更新日志

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.1.0] - 2026-03-25

### Added

#### 前端功能增强
- **候选人详情Modal** - 点击候选人卡片可查看完整匹配分析
  - 匹配度可视化进度条
  - 匹配标准vs JD要求对比
  - 候选人状态管理 (待沟通/面试中/Offer/淘汰)
  - 候选人备注功能
  - 单个候选人JSON导出

- **筛选结果导出**
  - JSON格式完整报告导出
  - CSV格式表格导出 (可用Excel打开)

- **BrowserPreview增强**
  - 步骤详细描述 (如"提取职位要求、技能关键词")
  - 当前步骤状态实时显示

#### 组件架构优化
- **组件清理** - 删除143个shadcn/ui通用组件，保留5个核心业务组件
- **Toast重构** - 从components移至providers，作为通用基础设施
- **CHANGELOG清理** - 移除过时的UI组件声明

### Changed

- **MatchResult组件** - 添加onClickhandler打开详情Modal
- **BrowserPreview组件** - steps数组增加description字段
- **screening页面** - 结果区域增加导出按钮组

---

## [1.0.0] - 2026-03-24

### Added

#### 后端核心
- **类型定义** (`types.py`)
  - JDInfo, ResumeInfo, MatchScore, ScreeningState
  - 完整的类型注解

- **JD解析Agent** (`jd_parser.py`)
  - 岗位名称提取
  - 经验/学历要求
  - 技能/行业关键词
  - 职责/薪资/地点

- **简历解析Agent** (`resume_parser.py`)
  - 候选人基本信息
  - 工作年限/学历
  - 技能/行业经验
  - 项目/成就提取

- **匹配评分Agent** (`matcher.py`)
  - 硬性条件匹配 (30%)
  - 技能匹配 (30%)
  - 行业经验 (20%)
  - 发展潜力 (20%)
  - 评分等级: ≥80强烈推荐, ≥60可备选

- **报告生成Agent** (`report_generator.py`)
  - Markdown/Dict格式
  - 筛选标准生成
  - 候选人排名

- **浏览器控制Agent** (`browser_controller.py`)
  - 基于browser-use封装
  - 初始化/动作执行/截图

- **竞品监控Agent** (`competitor_monitor.py`)
  - 竞品添加/移除
  - 快照创建/历史

#### LangGraph编排
- **筛选流程图** (`screening_graph.py`)
  - parse_jd_step → parse_resumes_step → match_resumes_step → generate_report_step
  - 流式进度回调

#### API层
- **筛选API** (`screening.py`)
  - POST /api/screening
  - POST /api/jd/parse
  - POST /api/resume/parse
  - POST /api/match

- **历史记录API** (`history.py`)
  - GET /api/history/reports
  - GET /api/history/reports/{id}
  - DELETE /api/history/reports/{id}

- **竞品监控API** (`competitor.py`)
  - POST /api/competitor/add
  - DELETE /api/competitor/{name}
  - GET /api/competitor/list
  - POST /api/competitor/snapshot

- **健康检查API** (`health.py`)
  - GET /api/health
  - GET /api/info

- **响应模型** (`responses.py`)
  - APIResponse, PaginatedResponse, ListResponse
  - StreamResponse, APIError
  - ErrorCode枚举

- **中间件** (`middleware.py`)
  - LoggingMiddleware
  - ErrorHandlingMiddleware

#### 工具模块
- **配置模块** (`config.py`)
  - 版本信息
  - 端口配置 (前端3777, 后端8004)
  - 配色方案
  - 匹配权重
  - 评分阈值
  - 技能/行业关键词

- **数据验证** (`validators.py`)
  - JD/简历验证
  - URL/邮箱/电话验证
  - 评分/年限验证
  - SchemaValidator

- **工具函数** (`utils.py`)
  - 文本处理
  - 数字/百分比格式化
  - 防抖/节流

- **数据存储** (`storage.py`)
  - MemoryStorage
  - FileStorage
  - 报告/竞品快照

- **日志配置** (`logging_config.py`)
  - 结构化日志
  - 日志级别控制

#### 前端核心业务组件
- JDInput - JD输入组件
- ResumeList - 简历列表组件
- MatchResult - 匹配结果展示组件
- ReportView - 报告查看组件
- BrowserPreview - 浏览器预览组件

#### 前端基础设施
- Toast提示系统 - 全局消息提示
- AppContext - 全局状态管理
- 暗色主题 - 科技蓝配色 (#0891B2)
- Framer Motion动画集成

#### 页面
- 筛选页面 (/screening) - 核心筛选流程
- 历史记录页面 (/history) - 历史筛选报告

#### 状态管理
- **Context** (`AppContext.tsx`)
  - 全局状态
  - 筛选状态

- **Hooks**
  - useScreening - 筛选逻辑
  - useAsync - 异步操作
  - useLocalStorage - 本地存储
  - useDebounce - 防抖

#### 开发工具
- **Shell脚本**
  - dev.sh - 开发启动
  - validate.sh - 项目验证

- **Python脚本**
  - setup_env.py - 环境设置

---

## [0.1.0] - 2026-03-23

### Added
- 项目初始化
- 基础架构设计
- browser-use参考集成