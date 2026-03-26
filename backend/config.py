"""
Spider - 配置模块
集中管理所有配置常量
"""

from typing import Final


# 版本信息
VERSION: Final[str] = "1.34.2"
APP_NAME: Final[str] = "Spider"
APP_DESCRIPTION: Final[str] = "垂直浏览器Agent - 简历筛选"


# 端口配置
API_HOST: Final[str] = "0.0.0.0"
API_PORT: Final[int] = 8004  # 后端API端口
FRONTEND_PORT: Final[int] = 3777  # 前端端口
API_DEBUG: Final[bool] = True


# 配色方案 - 科技蓝+深灰+数据看板感
COLORS: Final[dict] = {
    "primary": "#0891B2",  # 科技蓝
    "secondary": "#374151",  # 深灰
    "accent_green": "#10B981",  # 绿色（通过/成功）
    "accent_orange": "#F59E0B",  # 橙色（待定/警告）
    "background": "#111827",  # 深色背景
    "surface": "#1F2937",  # 卡片表面
    "text_primary": "#F9FAFB",  # 主文字
    "text_secondary": "#9CA3AF",  # 次要文字
}


# 匹配评分权重
MATCH_WEIGHTS: Final[dict] = {
    "hard_fit": 0.30,  # 硬性条件
    "skill": 0.30,  # 技能匹配
    "industry": 0.20,  # 行业经验
    "potential": 0.20,  # 潜力
}


# 评分等级阈值
SCORE_THRESHOLDS: Final[dict] = {
    "STRONG_RECOMMEND": 80,  # >= 80 强烈推荐
    "BACKUP": 60,  # >= 60 可备选
    "REJECTED": 0,  # < 60 不通过
}


# 评估等级描述
CANDIDATE_LEVELS: Final[dict] = {
    "STRONG_RECOMMEND": {
        "label": "强烈推荐",
        "emoji": "⭐",
        "color": "green",
    },
    "BACKUP": {
        "label": "可备选",
        "emoji": "🟡",
        "color": "yellow",
    },
    "REJECTED": {
        "label": "不通过",
        "emoji": "❌",
        "color": "red",
    },
}


# 经验等级映射
EDUCATION_LEVELS: Final[dict] = {
    "博士": 6,
    "硕士": 5,
    "研究生": 5,
    "本科": 4,
    "学士": 4,
    "大专": 3,
    "高中": 1,
    "中专": 2,
}


# 知名公司列表
FAMOUS_COMPANIES: Final[list] = [
    "阿里巴巴", "腾讯", "字节跳动", "百度", "京东", "美团", "拼多多",
    "华为", "网易", "快手", "滴滴", "小米", "OPPO", "vivo",
    "微软", "谷歌", "亚马逊", "苹果", "Meta", "Google", "Microsoft",
]


# 技能关键词
SKILL_KEYWORDS: Final[list] = [
    "Python", "Java", "Go", "Rust", "JavaScript", "TypeScript", "C++", "C#",
    "React", "Vue", "Angular", "Node.js", "Next.js", "Nuxt",
    "SQL", "NoSQL", "MongoDB", "PostgreSQL", "Redis",
    "AWS", "Azure", "GCP", "Docker", "Kubernetes",
    "Machine Learning", "Deep Learning", "NLP", "TensorFlow", "PyTorch",
    "Product Manager", "产品经理", "数据分析", "SQL", "Excel",
    "Agile", "Scrum", "项目管理", "团队管理", "OKR",
    "A/B测试", "用户增长", "留存", "转化率",
]


# 行业关键词
INDUSTRY_KEYWORDS: Final[list] = [
    "互联网", "电商", "金融", "教育", "医疗", "游戏",
    "SaaS", "企业服务", "B2B", "B2C", "O2O",
    "人工智能", "大数据", "云计算", "移动互联网",
]


# 筛选流程步骤
SCREENING_STEPS: Final[list] = [
    {"key": "init", "label": "等待开始", "icon": "⏳"},
    {"key": "parsing_jd", "label": "解析JD", "icon": "📋"},
    {"key": "parsing_resumes", "label": "解析简历", "icon": "📄"},
    {"key": "matching", "label": "匹配评分", "icon": "🔍"},
    {"key": "generating_report", "label": "生成报告", "icon": "📊"},
    {"key": "completed", "label": "完成", "icon": "✅"},
]


# 前端配置
FRONTEND_CONFIG: Final[dict] = {
    "title": "Spider - 垂直浏览器Agent",
    "description": "简历筛选自动化 - 垂直场景应用",
    "theme_color": "#3B82F6",
}


# CORS配置
CORS_ORIGINS: Final[list] = [
    "http://localhost:3777",
    "http://localhost:3000",
    "http://127.0.0.1:3777",
    "http://127.0.0.1:3000",
]