# Spider - 垂直浏览器Agent

> 代号 Spider (蛛)，意为"像蜘蛛一样在网页上织网、捕获信息"

## 项目定位

**核心问题**：需要一个**垂直场景**的浏览器Agent，不是做另一个browser-use（通用自动化），而是专注于**特定场景的自动化**。

**解决方案**：做一个**垂直领域的浏览器Agent**，比如"简历筛选Agent"——自动浏览招聘网站、筛选简历、生成推荐报告。

## 快速开始

### Docker部署（推荐）

```bash
docker-compose up -d
```

### 后端

```bash
cd backend

# 安装依赖
pip install -r requirements.txt

# 运行测试
pytest backend/tests/ -v

# 启动API服务
python -m backend.main
# 或
uvicorn backend.main:app --reload --port 8000
```

### 前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

## 项目结构

```
vertical-browser-agent/
├── backend/
│   ├── agents/           # Agent实现
│   │   ├── types.py      # 类型定义
│   │   ├── jd_parser.py  # JD解析Agent
│   │   ├── resume_parser.py  # 简历解析Agent
│   │   ├── matcher.py    # 匹配评分Agent
│   │   ├── report_generator.py  # 报告生成Agent
│   │   ├── browser_controller.py  # 浏览器控制Agent
│   │   ├── competitor_monitor.py  # 竞品监控Agent
│   │   └── llm_utils.py  # LLM调用工具
│   ├── graph/            # LangGraph编排
│   │   └── screening_graph.py  # 筛选流程编排
│   ├── api/              # API接口
│   │   ├── screening.py  # 筛选API
│   │   ├── history.py    # 历史记录API
│   │   ├── competitor.py  # 竞品监控API
│   │   ├── health.py     # 健康检查API
│   │   ├── responses.py  # 响应模型
│   │   └── middleware.py # 中间件
│   ├── tests/            # 测试
│   ├── main.py           # 主入口
│   ├── cli.py           # 命令行入口
│   ├── config.py         # 配置模块
│   ├── exceptions.py     # 异常定义
│   ├── validators.py     # 数据验证
│   ├── utils.py         # 工具函数
│   ├── exporters.py      # 数据导出
│   └── storage.py       # 内存存储
│
├── frontend/             # Next.js前端
│   └── src/
│       ├── app/          # 页面
│       ├── components/   # 组件
│       ├── hooks/       # React Hooks
│       └── utils/       # 工具函数
│
├── _reference/           # 参考项目
│   └── browser_use/      # browser-use参考代码
│
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## 核心流程

```
输入JD链接 + 简历列表
       ↓
浏览器控制Agent → 打开招聘网站
       ↓
JD解析Agent → 提取JD要求
       ↓
简历解析Agent → 逐个解析简历
       ↓
匹配评分Agent → 对比JD与简历
       ↓
报告生成Agent → 生成推荐报告
```

## 匹配评分算法

参考 Sigma hr-resume-screening skill：

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

## API接口

### 筛选API
| 接口 | 方法 | 描述 |
|------|------|------|
| `POST /api/screening` | POST | 简历筛选 |
| `POST /api/jd/parse` | POST | JD解析 |
| `POST /api/resume/parse` | POST | 简历解析 |
| `POST /api/match` | POST | 匹配评分 |

### 竞品API
| 接口 | 方法 | 描述 |
|------|------|------|
| `POST /api/competitor/add` | POST | 添加竞品 |
| `DELETE /api/competitor/{name}` | DELETE | 移除竞品 |
| `GET /api/competitor/list` | GET | 列出竞品 |
| `POST /api/competitor/snapshot` | POST | 创建快照 |

### 历史API
| 接口 | 方法 | 描述 |
|------|------|------|
| `GET /api/history/reports` | GET | 历史报告 |
| `GET /api/history/reports/{id}` | GET | 报告详情 |
| `DELETE /api/history/reports/{id}` | DELETE | 删除报告 |

### 系统API
| 接口 | 方法 | 描述 |
|------|------|------|
| `GET /api/info` | GET | 系统信息 |
| `GET /api/health` | GET | 健康检查 |

## 技术栈

- **后端**：Python, FastAPI, LangGraph
- **前端**：Next.js 14, React, TypeScript, Tailwind CSS
- **浏览器控制**：Playwright, browser-use
- **LLM**：Claude (MiniMax-M2)

## License

MIT