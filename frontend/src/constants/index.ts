/**
 * 前端常量定义
 */

export const APP_NAME = "Spider";
export const APP_VERSION = "1.0.0";
export const APP_DESCRIPTION = "垂直浏览器Agent - 简历筛选";

/**
 * API配置
 */
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8004",
  TIMEOUT: 30000,
  RETRY_COUNT: 3,
};

/**
 * 端口配置
 */
export const PORTS = {
  FRONTEND: 3777,
  BACKEND: 8004,
};

/**
 * 配色方案
 */
export const COLORS = {
  primary: "#0891B2", // 科技蓝/青色
  secondary: "#374151", // 深灰
  background: "#111827", // 深色背景
  surface: "#1F2937", // 卡片表面
  textPrimary: "#F9FAFB", // 主文字
  textSecondary: "#9CA3AF", // 次要文字
  accentGreen: "#10B981", // 绿色（通过/成功）
  accentOrange: "#F59E0B", // 橙色（待定/警告）
  accentRed: "#EF4444", // 红色（拒绝/错误）
  accentCyan: "#06B6D4", // 青色
  accentEmerald: "#10B981", // 翠绿
  accentAmber: "#F59E0B", // 琥珀
};

/**
 * 筛选步骤
 */
export const SCREENING_STEPS = [
  { key: "init", label: "等待开始", icon: "⏳" },
  { key: "parsing_jd", label: "解析JD", icon: "📋" },
  { key: "parsing_resumes", label: "解析简历", icon: "📄" },
  { key: "matching", label: "匹配评分", icon: "🔍" },
  { key: "generating_report", label: "生成报告", icon: "📊" },
  { key: "completed", label: "完成", icon: "✅" },
] as const;

/**
 * 评分阈值
 */
export const SCORE_THRESHOLDS = {
  STRONG_RECOMMEND: 80,
  BACKUP: 60,
  REJECTED: 0,
} as const;

/**
 * 候选人等级
 */
export const CANDIDATE_LEVELS = {
  STRONG_RECOMMEND: {
    label: "强烈推荐",
    emoji: "⭐",
    color: "emerald",
  },
  BACKUP: {
    label: "可备选",
    emoji: "🟡",
    color: "amber",
  },
  REJECTED: {
    label: "不通过",
    emoji: "❌",
    color: "red",
  },
} as const;

/**
 * 匹配评分权重
 */
export const MATCH_WEIGHTS = {
  hard_fit: 0.3,
  skill: 0.3,
  industry: 0.2,
  potential: 0.2,
} as const;

/**
 * 经验等级
 */
export const EDUCATION_LEVELS: Record<string, number> = {
  "博士": 6,
  "硕士": 5,
  "研究生": 5,
  "本科": 4,
  "学士": 4,
  "大专": 3,
  "高中": 1,
  "中专": 2,
};

/**
 * 知名公司列表
 */
export const FAMOUS_COMPANIES = [
  "阿里巴巴", "腾讯", "字节跳动", "百度", "京东", "美团", "拼多多",
  "华为", "网易", "快手", "滴滴", "小米", "OPPO", "vivo",
  "微软", "谷歌", "亚马逊", "苹果", "Meta", "Google", "Microsoft",
];

/**
 * 技能关键词
 */
export const SKILL_KEYWORDS = [
  "Python", "Java", "Go", "Rust", "JavaScript", "TypeScript", "C++", "C#",
  "React", "Vue", "Angular", "Node.js", "Next.js", "Nuxt",
  "SQL", "NoSQL", "MongoDB", "PostgreSQL", "Redis",
  "AWS", "Azure", "GCP", "Docker", "Kubernetes",
  "Machine Learning", "Deep Learning", "NLP", "TensorFlow", "PyTorch",
  "Product Manager", "产品经理", "数据分析", "SQL", "Excel",
  "Agile", "Scrum", "项目管理", "团队管理", "OKR",
  "A/B测试", "用户增长", "留存", "转化率",
];

/**
 * 行业关键词
 */
export const INDUSTRY_KEYWORDS = [
  "互联网", "电商", "金融", "教育", "医疗", "游戏",
  "SaaS", "企业服务", "B2B", "B2C", "O2O",
  "人工智能", "大数据", "云计算", "移动互联网",
];