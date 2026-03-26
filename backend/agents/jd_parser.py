"""
JD解析Agent
从JD文本中提取关键信息
"""

import re
from typing import Optional
from .types import JDText, JDInfo


class JDParser:
    """JD解析器"""

    # 学历模式
    EDUCATION_PATTERNS = [
        r"学历[：:]\s*([^\n，,]+)",
        r"要求[^\n]*学历[^\n]*([^\n，,]+)",
        r"本科|硕士|博士|大专|高中|中专",
    ]

    # 经验模式
    EXPERIENCE_PATTERNS = [
        r"(\d+)\s*年以上.*经验",
        r"经验[^\d]*(\d+)\s*年",
        r"(\d+)\s*-\s*(\d+)\s*年",
    ]

    # 技能关键词
    SKILL_KEYWORDS = [
        "Python", "Java", "Go", "Rust", "JavaScript", "TypeScript", "C++", "C#",
        "React", "Vue", "Angular", "Node.js",
        "SQL", "NoSQL", "MongoDB", "PostgreSQL",
        "AWS", "Azure", "GCP", "云",
        "Docker", "Kubernetes", "K8S",
        "AI", "Machine Learning", "Deep Learning", "NLP",
        "Product", "Product Manager", "产品经理",
        "Agile", "Scrum", "项目管理",
        "数据分析", "SQL", "Excel", "Python",
        "电商", "SaaS", "B2B", "B2C",
    ]

    # 行业关键词
    INDUSTRY_KEYWORDS = [
        "互联网", "电商", "金融", "教育", "医疗", "游戏",
        "SaaS", "企业服务", "B2B", "B2C", "O2O",
        "人工智能", "大数据", "云计算",
    ]

    def parse_jd(self, jd_text: JDText) -> JDInfo:
        """
        解析JD文本，提取关键信息

        Args:
            jd_text: JD原始文本

        Returns:
            JDInfo: 解析后的JD信息
        """
        text = jd_text.raw_text

        return JDInfo(
            position_name=self._extract_position_name(text),
            experience_required=self._extract_experience(text),
            education_required=self._extract_education(text),
            skills_required=self._extract_skills(text),
            industry_required=self._extract_industry(text),
            responsibilities=self._extract_responsibilities(text),
            salary_range=self._extract_salary(text),
            location=self._extract_location(text),
            source_url=jd_text.source_url or "",
        )

    def _extract_position_name(self, text: str) -> str:
        """提取岗位名称"""
        # 通常在第一行或包含"岗位"关键词的行
        lines = text.split("\n")
        for line in lines[:5]:  # 看前5行
            line = line.strip()
            if not line:
                continue
            # 去除常见前缀
            line = re.sub(r"^[【\[].*?[】\]]", "", line)
            line = re.sub(r"^(职位|岗位|岗位名称|职位名称)[：:]\s*", "", line)
            if line and len(line) < 30:
                return line
        return ""

    def _extract_experience(self, text: str) -> int:
        """提取经验要求"""
        for pattern in self.EXPERIENCE_PATTERNS:
            match = re.search(pattern, text)
            if match:
                if len(match.groups()) == 2:
                    return (int(match.group(1)) + int(match.group(2))) // 2
                return int(match.group(1))
        return 0

    def _extract_education(self, text: str) -> str:
        """提取学历要求"""
        education_levels = ["博士", "硕士", "本科", "大专", "高中", "中专"]
        for level in education_levels:
            if level in text:
                return level
        return "不限"

    def _extract_skills(self, text: str) -> list[str]:
        """提取技能要求"""
        skills = []
        text_upper = text.upper()
        for skill in self.SKILL_KEYWORDS:
            if skill.upper() in text_upper:
                skills.append(skill)
        return list(set(skills))

    def _extract_industry(self, text: str) -> list[str]:
        """提取行业要求"""
        industries = []
        for industry in self.INDUSTRY_KEYWORDS:
            if industry in text:
                industries.append(industry)
        return list(set(industries))

    def _extract_responsibilities(self, text: str) -> list[str]:
        """提取核心职责"""
        responsibilities = []
        lines = text.split("\n")
        for line in lines:
            line = line.strip()
            # 跳过空行和太短的行
            if not line or len(line) < 10:
                continue
            # 跳过明显的非职责内容
            if any(kw in line for kw in ["任职要求", "岗位要求", " qualification", "Requirement"]):
                continue
            if any(kw in line for kw in ["【", "】", "［", "］", "[", "]"]):
                continue
            responsibilities.append(line)
        return responsibilities[:10]  # 最多10条

    def _extract_salary(self, text: str) -> str:
        """提取薪资范围"""
        patterns = [
            r"(\d+)[kK]?-(\d+)[kK]?",
            r"¥?\s*(\d+)\s*-\s*(\d+)\s*(千|万)?",
            r"(\d+)\s*(千|万)/[月年]",
        ]
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                groups = match.groups()
                if len(groups) >= 2:
                    return f"{groups[0]}-{groups[1]}"
                return groups[0] if groups else ""
        return "面议"

    def _extract_location(self, text: str) -> str:
        """提取工作地点"""
        locations = ["北京", "上海", "深圳", "广州", "杭州", "南京", "成都", "武汉", "西安"]
        for loc in locations:
            if loc in text:
                return loc
        return ""


def parse_jd(jd_text: JDText) -> JDInfo:
    """解析JD的便捷函数"""
    parser = JDParser()
    return parser.parse_jd(jd_text)