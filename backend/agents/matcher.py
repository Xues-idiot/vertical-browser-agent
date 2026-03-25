"""
匹配评分Agent
计算JD与简历的匹配度

参考: Sigma hr-resume-screening skill
评估维度权重: 硬性条件30% + 专业能力30% + 发展潜力20% + 文化匹配20%
"""

from typing import Optional
from .types import JDInfo, ResumeInfo, MatchScore, MatchResult, CandidateLevel


class Matcher:
    """匹配评分器"""

    # 评估权重（总和100%）
    WEIGHTS = {
        "hard_fit": 0.30,  # 硬性条件
        "skill": 0.30,  # 技能匹配
        "industry": 0.20,  # 行业经验
        "potential": 0.20,  # 潜力
    }

    # 评分等级阈值
    THRESHOLDS = {
        CandidateLevel.STRONG_RECOMMEND: 80,  # >= 80 强烈推荐
        CandidateLevel.BACKUP: 60,  # >= 60 可备选
        CandidateLevel.REJECTED: 0,  # < 60 不通过
    }

    def calculate_score(self, jd: JDInfo, resume: ResumeInfo) -> MatchScore:
        """
        计算JD与简历的匹配分数

        Args:
            jd: JD信息
            resume: 简历信息

        Returns:
            MatchScore: 匹配分数
        """
        # 1. 硬性条件评分 (30%)
        hard_fit_score = self._calculate_hard_fit(jd, resume)

        # 2. 技能匹配评分 (30%)
        skill_score = self._calculate_skill_match(jd, resume)

        # 3. 行业经验评分 (20%)
        industry_score = self._calculate_industry_match(jd, resume)

        # 4. 潜力评分 (20%)
        potential_score = self._calculate_potential(jd, resume)

        # 计算总分
        total_score = (
            hard_fit_score * self.WEIGHTS["hard_fit"] +
            skill_score * self.WEIGHTS["skill"] +
            industry_score * self.WEIGHTS["industry"] +
            potential_score * self.WEIGHTS["potential"]
        )

        # 生成匹配详情
        details = self._generate_match_details(jd, resume, hard_fit_score, skill_score, industry_score, potential_score)

        return MatchScore(
            total_score=round(total_score, 1),
            hard_fit_score=round(hard_fit_score, 1),
            skill_score=round(skill_score, 1),
            industry_score=round(industry_score, 1),
            potential_score=round(potential_score, 1),
            match_details=details
        )

    def _calculate_hard_fit(self, jd: JDInfo, resume: ResumeInfo) -> float:
        """
        计算硬性条件得分
        包括: 经验年限、学历要求
        """
        score = 0.0
        max_score = 100.0

        # 经验年限评分 (最多50分)
        if jd.experience_required > 0:
            if resume.years_experience >= jd.experience_required:
                # 经验达标或超出
                extra = min(resume.years_experience - jd.experience_required, 5)
                score += 50 + extra * 5
            else:
                # 经验不足
                deficit = jd.experience_required - resume.years_experience
                score += max(0, 50 - deficit * 10)
        else:
            score += 50  # 无明确要求给50分

        # 学历评分 (最多50分)
        edu_score = self._calculate_education_score(jd.education_required, resume.education)
        score += edu_score

        return min(score, max_score)

    def _calculate_education_score(self, required: str, resume_edu: str) -> float:
        """计算学历匹配得分"""
        if not required or required == "不限":
            return 50.0

        edu_levels = {"高中": 1, "中专": 2, "大专": 3, "本科": 4, "学士": 4, "硕士": 5, "研究生": 5, "博士": 6}
        required_level = edu_levels.get(required, 3)
        resume_level = edu_levels.get(resume_edu, 4)

        if resume_level >= required_level:
            return 50.0
        else:
            return max(0, 30 - (required_level - resume_level) * 15)

    def _calculate_skill_match(self, jd: JDInfo, resume: ResumeInfo) -> float:
        """
        计算技能匹配得分
        基于技能重叠度
        """
        if not jd.skills_required:
            return 70.0  # 无明确要求给70分

        if not resume.skills:
            return 20.0  # 无技能给低分

        # 计算重叠率
        jd_skills_lower = {s.lower() for s in jd.skills_required}
        resume_skills_lower = {s.lower() for s in resume.skills}

        matched = jd_skills_lower & resume_skills_lower
        overlap_rate = len(matched) / len(jd_skills_lower) if jd_skills_lower else 0

        return min(overlap_rate * 100, 100)

    def _calculate_industry_match(self, jd: JDInfo, resume: ResumeInfo) -> float:
        """
        计算行业经验得分
        """
        if not jd.industry_required:
            return 70.0  # 无明确要求给70分

        if not resume.industry_experience:
            return 30.0  # 无行业经验给低分

        # 计算重叠率
        jd_industries_lower = {s.lower() for s in jd.industry_required}
        resume_industries_lower = {s.lower() for s in resume.industry_experience}

        matched = jd_industries_lower & resume_industries_lower
        overlap_rate = len(matched) / len(jd_industries_lower) if jd_industries_lower else 0

        return min(overlap_rate * 100, 100)

    def _calculate_potential(self, jd: JDInfo, resume: ResumeInfo) -> float:
        """
        计算潜力得分
        考虑: 知名公司背景、项目成果、学习能力
        """
        score = 50.0  # 基础分

        # 知名公司加分 (最多20分)
        famous_companies = ["阿里巴巴", "腾讯", "字节跳动", "百度", "京东", "美团",
                           "华为", "网易", "快手", "滴滴", "小米",
                           "微软", "谷歌", "亚马逊", "苹果", "Meta", "Google"]
        if resume.current_company:
            for company in famous_companies:
                if company in resume.current_company:
                    score += 20
                    break

        # 有成果数据加分 (最多15分)
        if resume.achievements:
            score += min(len(resume.achievements) * 5, 15)

        # 有重点项目加分 (最多15分)
        if resume.key_projects:
            score += min(len(resume.key_projects) * 5, 15)

        return min(score, 100)

    def _generate_match_details(
        self,
        jd: JDInfo,
        resume: ResumeInfo,
        hard_fit: float,
        skill: float,
        industry: float,
        potential: float
    ) -> list[str]:
        """生成匹配详情"""
        details = []

        # 硬性条件
        if hard_fit >= 80:
            details.append("✓ 硬性条件优秀")
        elif hard_fit >= 60:
            details.append("○ 硬性条件基本满足")
        else:
            details.append("✗ 硬性条件不足")

        # 技能匹配
        if jd.skills_required and resume.skills:
            jd_skills_lower = {s.lower() for s in jd.skills_required}
            resume_skills_lower = {s.lower() for s in resume.skills}
            matched = jd_skills_lower & resume_skills_lower
            if matched:
                details.append(f"✓ 技能匹配: {', '.join(matched)}")

        # 行业经验
        if jd.industry_required and resume.industry_experience:
            jd_ind_lower = {s.lower() for s in jd.industry_required}
            resume_ind_lower = {s.lower() for s in resume.industry_experience}
            matched = jd_ind_lower & resume_ind_lower
            if matched:
                details.append(f"✓ 行业经验: {', '.join(matched)}")

        # 潜力
        if resume.current_company:
            details.append(f"○ 公司背景: {resume.current_company}")

        return details

    def determine_level(self, score: MatchScore) -> CandidateLevel:
        """根据分数确定候选人等级"""
        if score.total_score >= self.THRESHOLDS[CandidateLevel.STRONG_RECOMMEND]:
            return CandidateLevel.STRONG_RECOMMEND
        elif score.total_score >= self.THRESHOLDS[CandidateLevel.BACKUP]:
            return CandidateLevel.BACKUP
        else:
            return CandidateLevel.REJECTED

    def create_match_result(self, jd: JDInfo, resume: ResumeInfo) -> MatchResult:
        """创建完整的匹配结果"""
        score = self.calculate_score(jd, resume)
        level = self.determine_level(score)

        match_reasons = []
        concerns = []

        # 生成匹配原因
        if level == CandidateLevel.STRONG_RECOMMEND:
            match_reasons.append(f"综合评分{score.total_score}分，匹配度高")
            if score.hard_fit_score >= 80:
                match_reasons.append("硬性条件优秀")
            if score.skill_score >= 80:
                match_reasons.append("技能高度匹配")
        elif level == CandidateLevel.BACKUP:
            match_reasons.append(f"综合评分{score.total_score}分，可作为备选")
            concerns.append("某方面略有不足")

        return MatchResult(
            resume=resume,
            score=score,
            level=level,
            match_reasons=match_reasons,
            concerns=concerns
        )

    def rank_candidates(self, results: list[MatchResult]) -> list[MatchResult]:
        """对候选人排序"""
        # 只保留通过筛选的
        passed = [r for r in results if r.level != CandidateLevel.REJECTED]
        # 按分数降序排列
        return sorted(passed, key=lambda x: x.score.total_score, reverse=True)


def calculate_score(jd: JDInfo, resume: ResumeInfo) -> MatchScore:
    """计算匹配分数的便捷函数"""
    matcher = Matcher()
    return matcher.calculate_score(jd, resume)


def match_and_rank(jd: JDInfo, resumes: list[ResumeInfo]) -> list[MatchResult]:
    """匹配并排序的便捷函数"""
    matcher = Matcher()
    results = [matcher.create_match_result(jd, resume) for resume in resumes]
    return matcher.rank_candidates(results)