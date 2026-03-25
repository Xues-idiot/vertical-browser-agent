"""
Spider - CLI入口
命令行接口
"""

import asyncio
import sys
from typing import Optional

from backend.graph.screening_graph import run_screening
from backend.agents.types import JDText, ResumeText
from backend.agents.jd_parser import JDParser
from backend.agents.resume_parser import ResumeParser
from backend.agents.report_generator import ReportGenerator
from backend.logging_config import setup_logger

logger = setup_logger("spider.cli")


def print_header():
    """打印头部"""
    print("=" * 50)
    print("🕷️  Spider - 垂直浏览器Agent")
    print("=" * 50)
    print()


def print_usage():
    """打印使用方法"""
    print("使用方法:")
    print("  python -m backend.cli jd <jd_text>           # 解析JD")
    print("  python -m backend.cli resume <resume_text>  # 解析简历")
    print("  python -m backend.cli match                 # 匹配评分")
    print("  python -m backend.cli report                # 生成报告")
    print()


async def cmd_jd(jd_text: str):
    """解析JD命令"""
    print(f"📋 解析JD...")
    parser = JDParser()
    jd_info = parser.parse_jd(JDText(raw_text=jd_text))

    print(f"\n✅ 解析结果:")
    print(f"  岗位: {jd_info.position_name}")
    print(f"  经验要求: {jd_info.experience_required}年")
    print(f"  学历要求: {jd_info.education_required}")
    print(f"  技能: {', '.join(jd_info.skills_required[:5])}")
    print(f"  行业: {', '.join(jd_info.industry_required)}")
    print(f"  薪资: {jd_info.salary_range}")


async def cmd_resume(resume_text: str):
    """解析简历命令"""
    print(f"📄 解析简历...")
    parser = ResumeParser()
    resume_info = parser.parse_resume(ResumeText(raw_text=resume_text))

    print(f"\n✅ 解析结果:")
    print(f"  姓名: {resume_info.candidate_name}")
    print(f"  当前职位: {resume_info.current_position}")
    print(f"  当前公司: {resume_info.current_company}")
    print(f"  工作年限: {resume_info.years_experience}年")
    print(f"  学历: {resume_info.education}")
    print(f"  技能: {', '.join(resume_info.skills[:5])}")


async def cmd_match():
    """匹配评分命令"""
    print("🔍 匹配评分功能需要更多输入...")


async def cmd_report():
    """生成报告命令"""
    print("📊 生成报告功能需要更多输入...")


async def main():
    """主函数"""
    print_header()

    if len(sys.argv) < 2:
        print_usage()
        return

    command = sys.argv[1].lower()

    if command == "jd" and len(sys.argv) >= 3:
        jd_text = " ".join(sys.argv[2:])
        await cmd_jd(jd_text)
    elif command == "resume" and len(sys.argv) >= 3:
        resume_text = " ".join(sys.argv[2:])
        await cmd_resume(resume_text)
    elif command in ["match", "report"]:
        await cmd_match() if command == "match" else cmd_report()
    else:
        print_usage()


if __name__ == "__main__":
    asyncio.run(main())