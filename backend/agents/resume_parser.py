"""
简历解析Agent
从简历文本中提取关键信息
"""

import re
from typing import Optional
from .types import ResumeText, ResumeInfo


class ResumeParser:
    """简历解析器"""

    # 常见技能关键词
    SKILL_KEYWORDS = [
        "Python", "Java", "Go", "Rust", "JavaScript", "TypeScript", "C++", "C#",
        "React", "Vue", "Angular", "Node.js", "Next.js", "Nuxt",
        "SQL", "NoSQL", "MongoDB", "PostgreSQL", "Redis",
        "AWS", "Azure", "GCP", "Docker", "Kubernetes",
        "Machine Learning", "Deep Learning", "NLP", "TensorFlow", "PyTorch",
        "Product Manager", "产品经理", "数据分析", "SQL", "Excel",
        "电商", "SaaS", "B2B", "B2C", "互联网",
        "Agile", "Scrum", "项目管理", "团队管理", "OKR",
        "A/B测试", "用户增长", "留存", "转化率",
    ]

    # 行业关键词
    INDUSTRY_KEYWORDS = [
        "互联网", "电商", "金融", "教育", "医疗", "游戏",
        "SaaS", "企业服务", "B2B", "B2C", "O2O",
        "人工智能", "大数据", "云计算", "移动互联网",
    ]

    def parse_resume(self, resume_text: ResumeText) -> ResumeInfo:
        """
        解析简历文本，提取关键信息

        Args:
            resume_text: 简历原始文本

        Returns:
            ResumeInfo: 解析后的简历信息
        """
        text = resume_text.raw_text

        return ResumeInfo(
            candidate_name=resume_text.candidate_name or self._extract_name(text),
            current_position=self._extract_position(text),
            current_company=self._extract_company(text),
            years_experience=self._extract_experience(text),
            education=self._extract_education(text),
            skills=self._extract_skills(text),
            industry_experience=self._extract_industry(text),
            key_projects=self._extract_projects(text),
            achievements=self._extract_achievements(text),
            contact_info=self._extract_contact(text),
        )

    def _extract_name(self, text: str) -> str:
        """提取候选人姓名"""
        lines = text.split("\n")
        for line in lines[:5]:
            line = line.strip()
            # 跳过空行
            if not line:
                continue
            # 跳过明显的标题行
            if any(kw in line for kw in ["简历", "CV", "Resume", "个人简历", "姓名"]):
                continue
            # 名字通常2-4个汉字
            match = re.search(r"^[【\[]?\s*([\u4e00-\u9fa5]{2,4})\s*[】\]]?\s*$", line)
            if match:
                return match.group(1)
            # 也可能是"姓名：张三"格式
            match = re.search(r"姓名[：:]\s*([\u4e00-\u9fa5]{2,4})", line)
            if match:
                return match.group(1)
        return ""

    def _extract_position(self, text: str) -> str:
        """提取当前/最近职位"""
        lines = text.split("\n")
        for line in lines:
            line = line.strip()
            if any(kw in line for kw in ["现任", "曾任", "职位", "岗位", "产品经理", "工程师", "总监", "主管"]):
                # 去除标签，保留实际职位
                match = re.search(r"([^\n，,]{3,20})(?:经理|总监|主管|工程师|负责人|专员|助理)", line)
                if match:
                    return match.group(1) + "经理" if "经理" not in match.group(1) else match.group(1)
        return ""

    def _extract_company(self, text: str) -> str:
        """提取公司名称"""
        companies = ["阿里巴巴", "腾讯", "字节跳动", "百度", "京东", "美团", "拼多多",
                     "华为", "网易", "快手", "滴滴", "小米", "OPPO", "vivo",
                     "微软", "谷歌", "亚马逊", "苹果", "Meta", "Google", "Microsoft",
                     "阿里", "腾讯", "字节", "百度", "京东"]
        for company in companies:
            if company in text:
                return company
        return ""

    def _extract_experience(self, text: str) -> int:
        """提取工作年限"""
        patterns = [
            r"(\d+)\s*年.*经验",
            r"经验[^\d]*(\d+)\s*年",
            r"工作\s*(\d+)\s*年",
        ]
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return int(match.group(1))
        return 0

    def _extract_education(self, text: str) -> str:
        """提取学历"""
        education_levels = ["博士", "硕士", "研究生", "本科", "学士", "大专", "MBA"]
        for level in education_levels:
            if level in text:
                return level
        return "本科"  # 默认本科

    def _extract_skills(self, text: str) -> list[str]:
        """提取技能"""
        skills = []
        text_upper = text.upper()
        for skill in self.SKILL_KEYWORDS:
            if skill.upper() in text_upper:
                skills.append(skill)
        return list(set(skills))

    def _extract_industry(self, text: str) -> list[str]:
        """提取行业经验"""
        industries = []
        for industry in self.INDUSTRY_KEYWORDS:
            if industry in text:
                industries.append(industry)
        return list(set(industries))

    def _extract_projects(self, text: str) -> list[str]:
        """提取重点项目"""
        projects = []
        lines = text.split("\n")
        for line in lines:
            line = line.strip()
            # 识别项目相关的行
            if any(kw in line for kw in ["项目", "Product", "产品"]):
                if len(line) > 10 and len(line) < 100:
                    projects.append(line)
        return projects[:5]  # 最多5个

    def _extract_achievements(self, text: str) -> list[str]:
        """提取成果"""
        achievements = []
        # 数字相关的成果更容易识别
        patterns = [
            r"(\d+%[\u4e00-\u9fa5]+)",
            r"增长\s*(\d+%)",
            r"提升\s*(\d+%)",
            r"(\d+)\s*(万|亿|千)[\u4e00-\u9fa5]*",
        ]
        for pattern in patterns:
            matches = re.findall(pattern, text)
            for match in matches:
                achievements.append(f"达成: {match}")
        return achievements[:5]

    def _extract_contact(self, text: str) -> str:
        """提取联系方式"""
        # 电话
        phone_match = re.search(r"1[3-9]\d{9}", text)
        phone = phone_match.group(0) if phone_match else ""

        # 邮箱
        email_match = re.search(r"[\w.-]+@[\w.-]+\.\w+", text)
        email = email_match.group(0) if email_match else ""

        contact = []
        if phone:
            contact.append(f"电话: {phone}")
        if email:
            contact.append(f"邮箱: {email}")

        return ", ".join(contact)


def parse_resume(resume_text: ResumeText) -> ResumeInfo:
    """解析简历的便捷函数"""
    parser = ResumeParser()
    return parser.parse_resume(resume_text)