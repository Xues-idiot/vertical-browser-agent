"""
Spider - 数据导出模块
支持导出为JSON、CSV、Markdown等格式
"""

import json
import csv
from io import StringIO
from typing import Any

from backend.agents.types import ScreeningReport


class JSONExporter:
    """JSON导出器"""

    @staticmethod
    def export(report: ScreeningReport) -> str:
        """导出为JSON字符串"""
        from backend.agents.report_generator import ReportGenerator
        generator = ReportGenerator()
        return json.dumps(generator.report_to_dict(report), ensure_ascii=False, indent=2)

    @staticmethod
    def save_to_file(report: ScreeningReport, filepath: str) -> None:
        """保存到JSON文件"""
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(JSONExporter.export(report))


class MarkdownExporter:
    """Markdown导出器"""

    @staticmethod
    def export(report: ScreeningReport) -> str:
        """导出为Markdown字符串"""
        from backend.agents.report_generator import ReportGenerator
        generator = ReportGenerator()
        return generator.report_to_markdown(report)

    @staticmethod
    def save_to_file(report: ScreeningReport, filepath: str) -> None:
        """保存到Markdown文件"""
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(MarkdownExporter.export(report))


class CSVExporter:
    """CSV导出器"""

    @staticmethod
    def export(report: ScreeningReport) -> str:
        """导出为CSV字符串"""
        output = StringIO()
        writer = csv.writer(output)

        # 写入表头
        writer.writerow([
            "排名", "姓名", "匹配度", "等级",
            "公司", "工作年限", "学历"
        ])

        # 写入强烈推荐
        for i, rec in enumerate(report.strong_recommendations, 1):
            writer.writerow([
                i,
                rec.candidate.candidate_name,
                f"{rec.match_score.total_score}%",
                "强烈推荐",
                rec.candidate.current_company,
                rec.candidate.years_experience,
                rec.candidate.education,
            ])

        # 写入备选
        for i, rec in enumerate(report.backup_candidates, len(report.strong_recommendations) + 1):
            writer.writerow([
                i,
                rec.candidate.candidate_name,
                f"{rec.match_score.total_score}%",
                "可备选",
                rec.candidate.current_company,
                rec.candidate.years_experience,
                rec.candidate.education,
            ])

        return output.getvalue()

    @staticmethod
    def save_to_file(report: ScreeningReport, filepath: str) -> None:
        """保存到CSV文件"""
        with open(filepath, "w", encoding="utf-8", newline="") as f:
            f.write(CSVExporter.export(report))


class ExporterFactory:
    """导出器工厂"""

    EXPORTERS = {
        "json": JSONExporter,
        "markdown": MarkdownExporter,
        "md": MarkdownExporter,
        "csv": CSVExporter,
    }

    @classmethod
    def get_exporter(cls, format: str):
        """获取指定格式的导出器"""
        format = format.lower()
        if format not in cls.EXPORTERS:
            raise ValueError(f"不支持的导出格式: {format}")
        return cls.EXPORTERS[format]

    @classmethod
    def export(cls, report: ScreeningReport, format: str) -> str:
        """导出为指定格式"""
        exporter = cls.get_exporter(format)
        return exporter.export(report)

    @classmethod
    def save_to_file(cls, report: ScreeningReport, filepath: str) -> None:
        """保存到文件（根据扩展名自动识别格式）"""
        if filepath.endswith(".json"):
            JSONExporter.save_to_file(report, filepath)
        elif filepath.endswith((".md", ".markdown")):
            MarkdownExporter.save_to_file(report, filepath)
        elif filepath.endswith(".csv"):
            CSVExporter.save_to_file(report, filepath)
        else:
            raise ValueError(f"不支持的文件扩展名: {filepath}")