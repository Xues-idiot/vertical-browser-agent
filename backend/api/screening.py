"""
筛选API接口
提供REST API供前端调用
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import asyncio

from backend.graph.screening_graph import run_screening, create_screening_graph
from backend.agents.report_generator import ReportGenerator

router = APIRouter()

# 请求模型
class ScreeningRequest(BaseModel):
    """筛选请求"""
    jd_url: str
    jd_content: Optional[str] = None  # 可选，如果提供则直接使用
    resume_list: list[str]  # 简历文本列表


class JDParseRequest(BaseModel):
    """JD解析请求"""
    jd_text: str
    source_url: Optional[str] = None


class ResumeParseRequest(BaseModel):
    """简历解析请求"""
    resume_text: str
    candidate_name: Optional[str] = None


# 响应模型
class ScreeningResponse(BaseModel):
    """筛选响应"""
    success: bool
    report: Optional[dict] = None
    error: Optional[str] = None


class JDParseResponse(BaseModel):
    """JD解析响应"""
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None


class ResumeParseResponse(BaseModel):
    """简历解析响应"""
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None


class MatchScoreResponse(BaseModel):
    """匹配评分响应"""
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None


class MatchRequest(BaseModel):
    """匹配请求"""
    jd_info: dict
    resume_info: dict


@router.post("/screening", response_model=ScreeningResponse)
async def screening(request: ScreeningRequest):
    """
    简历筛选接口

    输入JD和简历列表，返回筛选报告
    """
    try:
        # 使用graph运行筛选
        report = await run_screening(request.jd_url, request.resume_list)

        # 转换为dict
        generator = ReportGenerator()
        report_dict = generator.report_to_dict(report)

        return ScreeningResponse(
            success=True,
            report=report_dict
        )
    except Exception as e:
        return ScreeningResponse(
            success=False,
            error=str(e)
        )


@router.post("/screening/stream")
async def screening_stream(request: ScreeningRequest):
    """
    简历筛选接口（流式返回进度）

    暂时返回与普通筛选相同的结果
    """
    return await screening(request)


@router.post("/jd/parse", response_model=JDParseResponse)
async def parse_jd(request: JDParseRequest):
    """
    JD解析接口
    """
    try:
        from backend.agents.jd_parser import JDParser
        from backend.agents.types import JDText

        parser = JDParser()
        jd_text = JDText(raw_text=request.jd_text, source_url=request.source_url)
        jd_info = parser.parse_jd(jd_text)

        return JDParseResponse(
            success=True,
            data={
                "position_name": jd_info.position_name,
                "experience_required": jd_info.experience_required,
                "education_required": jd_info.education_required,
                "skills_required": jd_info.skills_required,
                "industry_required": jd_info.industry_required,
                "responsibilities": jd_info.responsibilities,
                "salary_range": jd_info.salary_range,
                "location": jd_info.location,
            }
        )
    except Exception as e:
        return JDParseResponse(success=False, error=str(e))


@router.post("/resume/parse", response_model=ResumeParseResponse)
async def parse_resume(request: ResumeParseRequest):
    """
    简历解析接口
    """
    try:
        from backend.agents.resume_parser import ResumeParser
        from backend.agents.types import ResumeText

        parser = ResumeParser()
        resume_text = ResumeText(
            raw_text=request.resume_text,
            candidate_name=request.candidate_name
        )
        resume_info = parser.parse_resume(resume_text)

        return ResumeParseResponse(
            success=True,
            data={
                "candidate_name": resume_info.candidate_name,
                "current_position": resume_info.current_position,
                "current_company": resume_info.current_company,
                "years_experience": resume_info.years_experience,
                "education": resume_info.education,
                "skills": resume_info.skills,
                "industry_experience": resume_info.industry_experience,
                "achievements": resume_info.achievements,
            }
        )
    except Exception as e:
        return ResumeParseResponse(success=False, error=str(e))


@router.post("/match", response_model=MatchScoreResponse)
async def match_resume(request: MatchRequest):
    """
    匹配评分接口
    """
    try:
        from backend.agents.matcher import Matcher
        from backend.agents.types import JDInfo, ResumeInfo

        # 使用传入的jd_info和resume_info
        jd_info = JDInfo(**request.jd_info)
        resume_info = ResumeInfo(**request.resume_info)

        # 匹配
        matcher = Matcher()
        score = matcher.calculate_score(jd_info, resume_info)

        return MatchScoreResponse(
            success=True,
            data={
                "total_score": score.total_score,
                "hard_fit_score": score.hard_fit_score,
                "skill_score": score.skill_score,
                "industry_score": score.industry_score,
                "potential_score": score.potential_score,
                "match_details": score.match_details,
            }
        )
    except Exception as e:
        return MatchScoreResponse(success=False, error=str(e))


# 为方便测试，提供简单的同步版本
def run_sync(jd_url: str, resume_list: list):
    """同步运行筛选（用于测试）"""
    return asyncio.run(run_screening(jd_url, resume_list))