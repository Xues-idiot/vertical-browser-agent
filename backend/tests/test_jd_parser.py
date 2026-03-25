"""
JD解析器测试
"""

import pytest
from backend.agents.jd_parser import JDParser, parse_jd
from backend.agents.types import JDText


class TestJDParser:
    """JD解析器测试"""

    def setup_method(self):
        self.parser = JDParser()

    def test_parse_simple_jd(self):
        """测试解析简单JD"""
        jd_text = JDText(
            raw_text="""
            高级产品经理

            岗位职责：
            1. 负责产品规划与设计
            2. 跨部门协调沟通
            3. 数据分析与优化

            任职要求：
            - 本科及以上学历
            - 3年以上产品经验
            - 有电商或SaaS经验优先
            - 熟练使用Axure、SQL

            薪资：20K-35K
            地点：北京
            """
        )

        result = self.parser.parse_jd(jd_text)

        assert result.position_name
        assert result.experience_required == 3
        assert result.education_required == "本科"
        assert len(result.skills_required) > 0
        assert "电商" in result.industry_required or "SaaS" in result.industry_required

    def test_extract_experience(self):
        """测试提取经验年限"""
        text = "5年以上互联网产品经验"
        experience = self.parser._extract_experience(text)
        assert experience == 5

    def test_extract_education(self):
        """测试提取学历"""
        text = "硕士及以上学历，计算机相关专业"
        education = self.parser._extract_education(text)
        assert education == "硕士"

    def test_extract_skills(self):
        """测试提取技能"""
        text = """
        任职要求：
        - 熟练使用Python、SQL
        - 了解机器学习
        - 有React开发经验
        """
        skills = self.parser._extract_skills(text)
        assert "Python" in skills
        assert "SQL" in skills
        assert "React" in skills

    def test_extract_salary(self):
        """测试提取薪资"""
        text = "薪资：25K-40K"
        salary = self.parser._extract_salary(text)
        assert "25" in salary
        assert "40" in salary


if __name__ == "__main__":
    pytest.main([__file__, "-v"])