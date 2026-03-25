"""
匹配器测试
"""

import pytest
from backend.agents.matcher import Matcher, calculate_score, match_and_rank
from backend.agents.types import JDInfo, ResumeInfo, CandidateLevel


class TestMatcher:
    """匹配器测试"""

    def setup_method(self):
        self.matcher = Matcher()

    def test_calculate_score_full_match(self):
        """测试完全匹配"""
        jd = JDInfo(
            position_name="高级产品经理",
            experience_required=3,
            education_required="本科",
            skills_required=["Python", "SQL", "产品经理"],
            industry_required=["电商", "SaaS"],
        )

        resume = ResumeInfo(
            candidate_name="张三",
            years_experience=5,
            education="本科",
            skills=["Python", "SQL", "产品经理", "React"],
            industry_experience=["电商", "SaaS", "互联网"],
            current_company="字节跳动",
            achievements=["用户增长200%", "转化率提升30%"],
        )

        score = self.matcher.calculate_score(jd, resume)

        assert score.total_score >= 80
        assert score.hard_fit_score >= 80
        assert score.skill_score >= 80
        assert score.industry_score >= 80

    def test_calculate_score_partial_match(self):
        """测试部分匹配"""
        jd = JDInfo(
            position_name="产品经理",
            experience_required=3,
            education_required="本科",
            skills_required=["Python", "SQL"],
            industry_required=["电商"],
        )

        resume = ResumeInfo(
            candidate_name="李四",
            years_experience=2,  # 经验不足
            education="大专",  # 学历不足
            skills=["Java"],  # 技能不匹配
            industry_experience=["教育"],  # 行业不匹配
        )

        score = self.matcher.calculate_score(jd, resume)

        assert score.total_score < 70

    def test_determine_level_strong_recommend(self):
        """测试强烈推荐等级"""
        from backend.agents.types import MatchScore
        score = MatchScore(total_score=85)
        level = self.matcher.determine_level(score)
        assert level == CandidateLevel.STRONG_RECOMMEND

    def test_determine_level_backup(self):
        """测试备选等级"""
        from backend.agents.types import MatchScore
        score = MatchScore(total_score=70)
        level = self.matcher.determine_level(score)
        assert level == CandidateLevel.BACKUP

    def test_determine_level_rejected(self):
        """测试不通过等级"""
        from backend.agents.types import MatchScore
        score = MatchScore(total_score=50)
        level = self.matcher.determine_level(score)
        assert level == CandidateLevel.REJECTED

    def test_create_match_result(self):
        """测试创建匹配结果"""
        jd = JDInfo(
            position_name="产品经理",
            experience_required=3,
            skills_required=["Python"],
        )

        resume = ResumeInfo(
            candidate_name="王五",
            years_experience=5,
            skills=["Python", "Java"],
        )

        result = self.matcher.create_match_result(jd, resume)

        assert result.resume.candidate_name == "王五"
        assert result.score.total_score > 0
        assert result.level in CandidateLevel

    def test_rank_candidates(self):
        """测试候选人排序"""
        jd = JDInfo(
            position_name="产品经理",
            experience_required=3,
            skills_required=["Python"],
        )

        resumes = [
            ResumeInfo(candidate_name="候选人A", years_experience=3, skills=["Python"],),
            ResumeInfo(candidate_name="候选人B", years_experience=5, skills=["Python", "Java"], current_company="字节跳动"),
            ResumeInfo(candidate_name="候选人C", years_experience=1, skills=["Java"],),
        ]

        results = [self.matcher.create_match_result(jd, r) for r in resumes]
        ranked = self.matcher.rank_candidates(results)

        # 字节跳动的候选人应该排第一
        assert ranked[0].resume.current_company == "字节跳动"
        # 不通过的应该被过滤
        assert len(ranked) <= len([r for r in results if r.level != CandidateLevel.REJECTED])


if __name__ == "__main__":
    pytest.main([__file__, "-v"])