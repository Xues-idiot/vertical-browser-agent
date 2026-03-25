"""
Spider - 工具函数模块
"""

import re
from typing import Any


def clean_text(text: str) -> str:
    """清理文本，移除多余空白字符"""
    if not text:
        return ""
    # 移除多余空白
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def extract_numbers(text: str) -> list[int]:
    """从文本中提取所有数字"""
    return [int(n) for n in re.findall(r'\d+', text)]


def extract_percentage(text: str) -> list[float]:
    """从文本中提取百分比"""
    return [float(p.strip('%')) for p in re.findall(r'\d+(?:\.\d+)?%', text)]


def truncate_text(text: str, max_length: int = 100, suffix: str = "...") -> str:
    """截断文本到指定长度"""
    if len(text) <= max_length:
        return text
    return text[:max_length - len(suffix)] + suffix


def normalize_company_name(company: str) -> str:
    """标准化公司名称"""
    # 移除常见后缀
    company = re.sub(r'(有限公司|股份有限公司|Co.,?\s*Ltd\.?|Inc\.?|LLC)$', '', company, flags=re.IGNORECASE)
    # 移除空格
    company = re.sub(r'\s+', '', company)
    return company


def calculate_text_similarity(text1: str, text2: str) -> float:
    """
    计算两个文本的相似度（简单版本，使用字符重叠率）
    返回 0-1 之间的分数
    """
    if not text1 or not text2:
        return 0.0

    set1 = set(text1.lower())
    set2 = set(text2.lower())

    intersection = len(set1 & set2)
    union = len(set1 | set2)

    if union == 0:
        return 0.0

    return intersection / union


def format_currency(amount: float, currency: str = "¥") -> str:
    """格式化货币"""
    if amount >= 10000:
        return f"{currency}{amount / 10000:.1f}万"
    return f"{currency}{amount:.0f}"


def parse_salary_range(salary_text: str) -> tuple[float, float]:
    """
    解析薪资范围文本，返回（最低，最高）
    例如: "25K-40K" -> (25000, 40000)
    """
    # 匹配 25K-40K 或 25000-40000 格式
    match = re.search(r'(\d+)(?:K|k)?\s*-\s*(\d+)(?:K|k)?', salary_text)
    if match:
        low = int(match.group(1))
        high = int(match.group(2))
        # 如果数值小于1000，假设是K单位
        if low < 1000:
            low *= 1000
        if high < 1000:
            high *= 1000
        return (low, high)

    # 匹配单一数值
    single = re.search(r'(\d+)(?:K|k)?', salary_text)
    if single:
        value = int(single.group(1))
        if value < 1000:
            value *= 1000
        return (value, value)

    return (0, 0)