"""
Spider - 垂直浏览器Agent
类型定义模块
"""

from typing import Optional
from dataclasses import dataclass, field
from enum import Enum


class CandidateLevel(str, Enum):
    """候选人等级"""
    STRONG_RECOMMEND = "strong_recommend"  # 强烈推荐
    BACKUP = "backup"  # 可备选
    REJECTED = "rejected"  # 不通过


@dataclass
class JDText:
    """JD原始文本"""
    raw_text: str
    source_url: Optional[str] = None
    source_platform: Optional[str] = None  # 招聘平台


@dataclass
class JDInfo:
    """JD解析结果"""
    position_name: str = ""  # 岗位名称
    department: str = ""  # 部门
    experience_required: int = 0  # 经验要求（年）
    education_required: str = ""  # 学历要求
    skills_required: list[str] = field(default_factory=list)  # 技能要求
    industry_required: list[str] = field(default_factory=list)  # 行业要求
    responsibilities: list[str] = field(default_factory=list)  # 核心职责
    salary_range: str = ""  # 薪资范围
    location: str = ""  # 工作地点
    source_url: str = ""  # JD来源URL


@dataclass
class ResumeText:
    """简历原始文本"""
    raw_text: str
    candidate_name: Optional[str] = None
    source_url: Optional[str] = None


@dataclass
class ResumeInfo:
    """简历解析结果"""
    candidate_name: str = ""
    current_position: str = ""  # 当前职位
    current_company: str = ""  # 当前公司
    years_experience: int = 0  # 工作年限
    education: str = ""  # 学历
    skills: list[str] = field(default_factory=list)  # 技能
    industry_experience: list[str] = field(default_factory=list)  # 行业经验
    key_projects: list[str] = field(default_factory=list)  # 重点项目
    achievements: list[str] = field(default_factory=list)  # 成果
    contact_info: str = ""  # 联系方式


@dataclass
class MatchScore:
    """匹配分数"""
    total_score: float = 0.0  # 总分 0-100
    hard_fit_score: float = 0.0  # 硬性条件得分
    skill_score: float = 0.0  # 技能匹配得分
    industry_score: float = 0.0  # 行业经验得分
    potential_score: float = 0.0  # 潜力得分
    match_details: list[str] = field(default_factory=list)  # 匹配详情


@dataclass
class MatchResult:
    """匹配结果"""
    resume: ResumeInfo
    score: MatchScore
    level: CandidateLevel
    match_reasons: list[str] = field(default_factory=list)  # 匹配原因
    concerns: list[str] = field(default_factory=list)  # 顾虑


@dataclass
class CandidateRecommendation:
    """候选人推荐"""
    candidate: ResumeInfo
    match_score: MatchScore
    level: CandidateLevel
    match_summary: str = ""  # 匹配摘要


@dataclass
class ScreeningReport:
    """筛选报告"""
    position_name: str = ""
    jd_source: str = ""
    total_resumes: int = 0
    screened_resumes: int = 0
    strong_recommendations: list[CandidateRecommendation] = field(default_factory=list)
    backup_candidates: list[CandidateRecommendation] = field(default_factory=list)
    screening_criteria: list[str] = field(default_factory=list)
    generated_at: str = ""


@dataclass
class ScreeningState:
    """筛选状态（用于LangGraph）"""
    jd_url: str = ""
    jd_content: Optional[str] = None  # JD文本内容（直接输入时使用）
    resume_list: list = field(default_factory=list)
    jd_info: Optional[JDInfo] = None
    resume_infos: list[ResumeInfo] = field(default_factory=list)
    match_results: list[MatchResult] = field(default_factory=list)
    report: Optional[ScreeningReport] = None
    current_step: str = "init"
    error: Optional[str] = None


# Browser相关类型
@dataclass
class BrowserSession:
    """浏览器会话"""
    session_id: str
    browser_type: str = "chromium"
    headless: bool = True


@dataclass
class BrowserAction:
    """浏览器动作"""
    action_type: str  # navigate, click, input, screenshot, etc.
    target: Optional[str] = None
    value: Optional[str] = None
    screenshot: bool = False