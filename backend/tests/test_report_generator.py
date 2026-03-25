"""
报告生成器测试
"""

import pytest
from backend.agents.report_generator import ReportGenerator, generate_report
from backend.agents.types import (
    JDInfo,
    ResumeInfo,
    MatchResult,
    MatchScore,
    CandidateLevel,
)


class TestReportGenerator:
    """报告生成器测试"""

    def setup_method(self):
        self.generator = ReportGenerator()

    def test_generate_report(self):
        """测试生成报告"""
        jd = JDInfo(
            position_name="高级产品经理",
            experience_required=3,
            education_required="本科",
            skills_required=["Python", "SQL"],
            industry_required=["电商", "SaaS"],
            salary_range="25K-40K",
        )

        match_results = [
            MatchResult(
                resume=ResumeInfo(
                    candidate_name="张三",
                    years_experience=5,
                    skills=["Python", "SQL", "React"],
                    industry_experience=["电商", "SaaS"],
                    current_company="字节跳动",
                ),
                score=MatchScore(total_score=88, hard_fit_score=90, skill_score=85),
                level=CandidateLevel.STRONG_RECOMMEND,
                match_reasons=["综合评分88分"],
                concerns=[],
            ),
            MatchResult(
                resume=ResumeInfo(
                    candidate_name="李四",
                    years_experience=3,
                    skills=["Python"],
                    industry_experience=["电商"],
                ),
                score=MatchScore(total_score=72, hard_fit_score=75, skill_score=70),
                level=CandidateLevel.BACKUP,
                match_reasons=["基本匹配"],
                concerns=["技能稍少"],
            ),
        ]

        report = self.generator.generate_report(jd, match_results)

        assert report.position_name == "高级产品经理"
        assert report.total_resumes == 2
        assert report.screened_resumes == 2
        assert len(report.strong_recommendations) == 1
        assert len(report.backup_candidates) == 1
        assert len(report.screening_criteria) > 0

    def test_format_recommendation(self):
        """测试格式化推荐"""
        result = MatchResult(
            resume=ResumeInfo(
                candidate_name="王五",
                years_experience=5,
                skills=["Python"],
                current_company="阿里巴巴",
            ),
            score=MatchScore(
                total_score=85,
                hard_fit_score=90,
                skill_score=80,
                match_details=["✓ 硬性条件优秀", "✓ 技能匹配: Python"],
            ),
            level=CandidateLevel.STRONG_RECOMMEND,
            match_reasons=["匹配度高"],
            concerns=[],
        )

        rec = self.generator.format_recommendation(result)

        assert rec.candidate.candidate_name == "王五"
        assert rec.match_score.total_score == 85
        assert rec.level == CandidateLevel.STRONG_RECOMMEND

    def test_report_to_markdown(self):
        """测试转换为Markdown"""
        from backend.agents.types import CandidateRecommendation

        report = ReportGenerator().generate_report(
            JDInfo(position_name="测试岗位"),
            [
                MatchResult(
                    resume=ResumeInfo(candidate_name="测试候选人", years_experience=3),
                    score=MatchScore(total_score=80),
                    level=CandidateLevel.STRONG_RECOMMEND,
                )
            ],
        )

        markdown = self.generator.report_to_markdown(report)

        assert "# 简历筛选报告" in markdown
        assert "测试候选人" in markdown
        assert "80%" in markdown

    def test_report_to_dict(self):
        """测试转换为字典"""
        report = ReportGenerator().generate_report(
            JDInfo(position_name="测试岗位"),
            [
                MatchResult(
                    resume=ResumeInfo(candidate_name="测试候选人"),
                    score=MatchScore(total_score=80),
                    level=CandidateLevel.STRONG_RECOMMEND,
                )
            ],
        )

        report_dict = self.generator.report_to_dict(report)

        assert report_dict["position_name"] == "测试岗位"
        assert report_dict["total_resumes"] == 1
        assert len(report_dict["strong_recommendations"]) == 1
        assert report_dict["strong_recommendations"][0]["candidate_name"] == "测试候选人"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])