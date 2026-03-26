"""
报告生成Agent
生成简历筛选报告
"""

from datetime import datetime
from typing import Optional
from .types import (
    ScreeningReport,
    CandidateRecommendation,
    MatchResult,
    CandidateLevel,
    JDInfo
)


class ReportGenerator:
    """报告生成器"""

    def generate_report(
        self,
        jd: JDInfo,
        match_results: list[MatchResult]
    ) -> ScreeningReport:
        """
        生成筛选报告

        Args:
            jd: JD信息
            match_results: 匹配结果列表

        Returns:
            ScreeningReport: 筛选报告
        """
        # 分离强烈推荐和备选
        strong_recommend = []
        backup = []

        for result in match_results:
            rec = self.format_recommendation(result)
            if result.level == CandidateLevel.STRONG_RECOMMEND:
                strong_recommend.append(rec)
            elif result.level == CandidateLevel.BACKUP:
                backup.append(rec)

        # 统计筛选标准
        criteria = self._generate_criteria(jd)

        # 统计通过率
        total = len(match_results)
        passed = len(strong_recommend) + len(backup)

        return ScreeningReport(
            position_name=jd.position_name or "未知岗位",
            jd_source=jd.source_url or jd.location or "未知来源",
            total_resumes=total,
            screened_resumes=passed,
            strong_recommendations=strong_recommend,
            backup_candidates=backup,
            screening_criteria=criteria,
            generated_at=datetime.now().strftime("%Y-%m-%d %H:%M")
        )

    def format_recommendation(self, result: MatchResult) -> CandidateRecommendation:
        """
        格式化候选人推荐

        Args:
            result: 匹配结果

        Returns:
            CandidateRecommendation: 候选人推荐
        """
        # 生成匹配摘要
        summary_parts = []

        if result.score.total_score >= 80:
            summary_parts.append(f"匹配度 {result.score.total_score}% (优秀)")
        elif result.score.total_score >= 60:
            summary_parts.append(f"匹配度 {result.score.total_score}% (良好)")
        else:
            summary_parts.append(f"匹配度 {result.score.total_score}% (一般)")

        if result.resume.years_experience > 0:
            summary_parts.append(f"{result.resume.years_experience}年经验")

        if result.resume.current_company:
            summary_parts.append(result.resume.current_company)

        summary = " - ".join(summary_parts)

        return CandidateRecommendation(
            candidate=result.resume,
            match_score=result.score,
            level=result.level,
            match_summary=summary
        )

    def _generate_criteria(self, jd: JDInfo) -> list[str]:
        """生成筛选标准"""
        criteria = []

        if jd.experience_required > 0:
            criteria.append(f"经验年限 ≥ {jd.experience_required}年")

        if jd.education_required and jd.education_required != "不限":
            criteria.append(f"学历要求: {jd.education_required}以上")

        if jd.skills_required:
            top_skills = jd.skills_required[:5]
            criteria.append(f"核心技能: {', '.join(top_skills)}")

        if jd.industry_required:
            criteria.append(f"行业经验: {'/'.join(jd.industry_required)}")

        return criteria

    def report_to_markdown(self, report: ScreeningReport) -> str:
        """将报告转换为Markdown格式"""
        lines = [
            "# 简历筛选报告 - Spider",
            "",
            f"**岗位**: {report.position_name}",
            f"**JD来源**: {report.jd_source}",
            f"**收到简历**: {report.total_resumes}份 → **筛选后**: {report.screened_resumes}份",
            "",
            "---",
            "",
        ]

        # 强烈推荐
        if report.strong_recommendations:
            lines.append(f"## ⭐ 强烈推荐 ({len(report.strong_recommendations)}份)")
            lines.append("")
            for i, rec in enumerate(report.strong_recommendations, 1):
                lines.append(f"### {i}. {rec.candidate.candidate_name} ({rec.candidate.years_experience}年经验) - 匹配度 {rec.match_score.total_score}%")
                lines.append("")
                for detail in rec.match_score.match_details[:3]:
                    lines.append(f"- {detail}")
                if rec.candidate.current_company:
                    lines.append(f"- 公司: {rec.candidate.current_company}")
                lines.append("")

        # 备选
        if report.backup_candidates:
            lines.append(f"## 🟡 可备选 ({len(report.backup_candidates)}份)")
            lines.append("")
            for i, rec in enumerate(report.backup_candidates, 1):
                lines.append(f"### {i}. {rec.candidate.candidate_name} ({rec.candidate.years_experience}年经验) - 匹配度 {rec.match_score.total_score}%")
                lines.append("")

        # 筛选标准
        if report.screening_criteria:
            lines.append("## 💡 筛选标准")
            lines.append("")
            for criterion in report.screening_criteria:
                lines.append(f"- {criterion}")
            lines.append("")

        lines.append(f"---")
        lines.append(f"*报告生成时间: {report.generated_at}*")

        return "\n".join(lines)

    def report_to_dict(self, report: ScreeningReport) -> dict:
        """将报告转换为字典格式（便于API返回）"""
        return {
            "position_name": report.position_name,
            "jd_source": report.jd_source,
            "total_resumes": report.total_resumes,
            "screened_resumes": report.screened_resumes,
            "strong_recommendations": [
                {
                    "candidate_name": rec.candidate.candidate_name,
                    "match_score": rec.match_score.total_score,
                    "level": rec.level.value,
                    "summary": rec.match_summary,
                    "current_company": rec.candidate.current_company,
                    "years_experience": rec.candidate.years_experience,
                }
                for rec in report.strong_recommendations
            ],
            "backup_candidates": [
                {
                    "candidate_name": rec.candidate.candidate_name,
                    "match_score": rec.match_score.total_score,
                    "level": rec.level.value,
                    "summary": rec.match_summary,
                    "current_company": rec.candidate.current_company,
                    "years_experience": rec.candidate.years_experience,
                }
                for rec in report.backup_candidates
            ],
            "screening_criteria": report.screening_criteria,
            "generated_at": report.generated_at,
        }


def generate_report(jd: JDInfo, match_results: list[MatchResult]) -> ScreeningReport:
    """生成报告的便捷函数"""
    generator = ReportGenerator()
    return generator.generate_report(jd, match_results)