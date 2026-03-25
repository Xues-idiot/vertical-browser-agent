"""
筛选Graph
使用LangGraph编排简历筛选流程

流程:
输入JD链接 + 简历列表
    ↓
浏览器控制Agent → 打开招聘网站
    ↓
JD解析Agent → 提取JD要求
    ↓
简历解析Agent → 逐个解析简历
    ↓
匹配评分Agent → 对比JD与简历
    ↓
报告生成Agent → 生成推荐报告
"""

import asyncio
from typing import Optional
from dataclasses import dataclass, field

from backend.agents.types import (
    JDText,
    JDInfo,
    ResumeText,
    ResumeInfo,
    MatchResult,
    ScreeningReport,
    ScreeningState,
    CandidateLevel,
)
from backend.agents.jd_parser import JDParser
from backend.agents.resume_parser import ResumeParser
from backend.agents.matcher import Matcher
from backend.agents.report_generator import ReportGenerator


class ScreeningGraph:
    """简历筛选Graph"""

    def __init__(self):
        self.jd_parser = JDParser()
        self.resume_parser = ResumeParser()
        self.matcher = Matcher()
        self.report_generator = ReportGenerator()

    async def parse_jd_step(self, state: ScreeningState) -> ScreeningState:
        """
        步骤1: 解析JD

        Args:
            state: 当前状态

        Returns:
            ScreeningState: 更新后的状态
        """
        state.current_step = "parsing_jd"

        try:
            # 使用browser_controller获取JD内容
            # 这里简化处理，直接用state中的内容
            jd_text = JDText(
                raw_text=state.jd_url,  # 实际上应该是从浏览器获取的内容
                source_url=state.jd_url,
            )

            jd_info = self.jd_parser.parse_jd(jd_text)
            state.jd_info = jd_info
            state.error = None
        except Exception as e:
            state.error = f"JD解析失败: {str(e)}"

        return state

    async def parse_resumes_step(self, state: ScreeningState) -> ScreeningState:
        """
        步骤2: 解析简历列表

        Args:
            state: 当前状态

        Returns:
            ScreeningState: 更新后的状态
        """
        state.current_step = "parsing_resumes"

        try:
            resume_infos = []
            for resume_text in state.resume_list:
                if isinstance(resume_text, str):
                    resume_text = ResumeText(raw_text=resume_text)
                resume_info = self.resume_parser.parse_resume(resume_text)
                resume_infos.append(resume_info)

            state.resume_infos = resume_infos
            state.error = None
        except Exception as e:
            state.error = f"简历解析失败: {str(e)}"

        return state

    async def match_resumes_step(self, state: ScreeningState) -> ScreeningState:
        """
        步骤3: 匹配简历与JD

        Args:
            state: 当前状态

        Returns:
            ScreeningState: 更新后的状态
        """
        state.current_step = "matching"

        try:
            if state.jd_info is None:
                raise ValueError("JD信息未解析")

            match_results = []
            for resume_info in state.resume_infos:
                result = self.matcher.create_match_result(state.jd_info, resume_info)
                # 只保留通过筛选的
                if result.level != CandidateLevel.REJECTED:
                    match_results.append(result)

            # 排序
            state.match_results = self.matcher.rank_candidates(match_results)
            state.error = None
        except Exception as e:
            state.error = f"匹配失败: {str(e)}"

        return state

    async def generate_report_step(self, state: ScreeningState) -> ScreeningState:
        """
        步骤4: 生成报告

        Args:
            state: 当前状态

        Returns:
            ScreeningState: 更新后的状态
        """
        state.current_step = "generating_report"

        try:
            if state.jd_info is None:
                raise ValueError("JD信息未解析")

            report = self.report_generator.generate_report(
                state.jd_info,
                state.match_results
            )
            state.report = report
            state.current_step = "completed"
            state.error = None
        except Exception as e:
            state.error = f"报告生成失败: {str(e)}"

        return state

    async def run_screening(
        self,
        jd_url: str,
        resume_list: list,
    ) -> ScreeningReport:
        """
        运行完整筛选流程

        Args:
            jd_url: JD链接
            resume_list: 简历列表

        Returns:
            ScreeningReport: 筛选报告
        """
        # 初始化状态
        state = ScreeningState(
            jd_url=jd_url,
            resume_list=resume_list,
        )

        # 步骤1: 解析JD
        state = await self.parse_jd_step(state)
        if state.error:
            raise RuntimeError(state.error)

        # 步骤2: 解析简历
        state = await self.parse_resumes_step(state)
        if state.error:
            raise RuntimeError(state.error)

        # 步骤3: 匹配
        state = await self.match_resumes_step(state)
        if state.error:
            raise RuntimeError(state.error)

        # 步骤4: 生成报告
        state = await self.generate_report_step(state)
        if state.error:
            raise RuntimeError(state.error)

        return state.report

    async def run_screening_stream(
        self,
        jd_url: str,
        resume_list: list,
    ):
        """
        运行筛选流程（带进度回调）

        Args:
            jd_url: JD链接
            resume_list: 简历列表

        Yields:
            ScreeningState: 每一步的状态
        """
        state = ScreeningState(
            jd_url=jd_url,
            resume_list=resume_list,
        )

        # 步骤1: 解析JD
        state = await self.parse_jd_step(state)
        yield state
        if state.error:
            return

        # 步骤2: 解析简历
        state = await self.parse_resumes_step(state)
        yield state
        if state.error:
            return

        # 步骤3: 匹配
        state = await self.match_resumes_step(state)
        yield state
        if state.error:
            return

        # 步骤4: 生成报告
        state = await self.generate_report_step(state)
        yield state


def create_screening_graph() -> ScreeningGraph:
    """创建筛选Graph的便捷函数"""
    return ScreeningGraph()


async def run_screening(
    jd_url: str,
    resume_list: list,
) -> ScreeningReport:
    """运行筛选的便捷函数"""
    graph = create_screening_graph()
    return await graph.run_screening(jd_url, resume_list)