"""
简历解析器测试
"""

import pytest
from backend.agents.resume_parser import ResumeParser, parse_resume
from backend.agents.types import ResumeText


class TestResumeParser:
    """简历解析器测试"""

    def setup_method(self):
        self.parser = ResumeParser()

    def test_parse_simple_resume(self):
        """测试解析简单简历"""
        resume_text = ResumeText(
            raw_text="""
            张三

            当前职位：高级产品经理
            当前公司：字节跳动
            工作年限：5年

            学历：本科 - 清华大学

            技能：Python、SQL、产品设计、用户增长
            行业经验：互联网、电商、SaaS

            重点项目：
            - 电商平台用户增长项目
            - SaaS产品规划与落地

            成果：
            - 带领团队实现月活增长200%
            - 优化转化率提升30%
            """,
            candidate_name="张三"
        )

        result = self.parser.parse_resume(resume_text)

        assert result.candidate_name == "张三"
        assert result.years_experience == 5
        assert result.education == "本科"
        assert len(result.skills) >= 2
        assert len(result.industry_experience) >= 1

    def test_extract_name(self):
        """测试提取姓名"""
        text = """
        李四

        求职意向：产品经理
        """
        name = self.parser._extract_name(text)
        assert name == "李四"

    def test_extract_experience(self):
        """测试提取工作年限"""
        text = "8年互联网产品经验"
        experience = self.parser._extract_experience(text)
        assert experience == 8

    def test_extract_education(self):
        """测试提取学历"""
        text = "硕士学历毕业于清华大学"
        education = self.parser._extract_education(text)
        assert education == "硕士"

    def test_extract_company(self):
        """测试提取公司"""
        text = "曾在阿里巴巴工作3年"
        company = self.parser._extract_company(text)
        assert "阿里巴巴" in company or "阿里" in company

    def test_extract_skills(self):
        """测试提取技能"""
        text = """
        技能：
        - Python, Java
        - SQL, MongoDB
        - React, Vue
        """
        skills = self.parser._extract_skills(text)
        assert "Python" in skills
        assert "Java" in skills
        assert "SQL" in skills


if __name__ == "__main__":
    pytest.main([__file__, "-v"])