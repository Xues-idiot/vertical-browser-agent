"""
Spider - 文本处理工具
文本清洗、提取、转换工具
"""

import re
from typing import List, Optional, Tuple
from datetime import datetime


def clean_text(text: str) -> str:
    """清理文本"""
    if not text:
        return ""

    # 移除多余空白
    text = re.sub(r'\s+', ' ', text)
    # 移除特殊字符
    text = re.sub(r'[\x00-\x08\x0b-\x0c\x0e-\x1f\x7f]', '', text)
    return text.strip()


def extract_numbers(text: str) -> List[float]:
    """提取文本中的数字"""
    pattern = r'-?\d+\.?\d*'
    matches = re.findall(pattern, text)
    return [float(m) for m in matches if m]


def extract_phone_numbers(text: str) -> List[str]:
    """提取手机号"""
    pattern = r'1[3-9]\d{9}'
    return re.findall(pattern, text)


def extract_emails(text: str) -> List[str]:
    """提取邮箱"""
    pattern = r'[\w\.-]+@[\w\.-]+\.\w+'
    return re.findall(pattern, text)


def extract_urls(text: str) -> List[str]:
    """提取URL"""
    pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
    return re.findall(pattern, text)


def extract_chinese(text: str) -> str:
    """提取中文"""
    pattern = r'[\u4e00-\u9fff]+'
    return ''.join(re.findall(pattern, text))


def extract_english(text: str) -> str:
    """提取英文"""
    pattern = r'[a-zA-Z]+'
    return ' '.join(re.findall(pattern, text))


def truncate(text: str, max_length: int, suffix: str = "...") -> str:
    """截断文本"""
    if len(text) <= max_length:
        return text
    return text[:max_length - len(suffix)] + suffix


def split_sentences(text: str) -> List[str]:
    """分割句子"""
    # 按中英文标点分割
    pattern = r'[。！？.!?]+'
    sentences = re.split(pattern, text)
    return [s.strip() for s in sentences if s.strip()]


def normalize_whitespace(text: str) -> str:
    """标准化空白字符"""
    return ' '.join(text.split())


def remove_html_tags(text: str) -> str:
    """移除HTML标签"""
    return re.sub(r'<[^>]+>', '', text)


def extract_keywords(text: str, top_n: int = 10) -> List[Tuple[str, int]]:
    """提取关键词(简单实现)"""
    # 移除停用词
    stop_words = {'的', '了', '和', '是', '在', '我', '有', '个', '人', '这', '不', '也', '就', '都', '要', '会', '可以', '能'}
    words = re.findall(r'\w+', text)
    word_count = {}
    for word in words:
        if len(word) > 1 and word not in stop_words:
            word_count[word] = word_count.get(word, 0) + 1
    sorted_words = sorted(word_count.items(), key=lambda x: x[1], reverse=True)
    return sorted_words[:top_n]


def highlight_keywords(text: str, keywords: List[str], tag: str = "**") -> str:
    """高亮关键词"""
    result = text
    for keyword in keywords:
        pattern = re.compile(re.escape(keyword), re.IGNORECASE)
        result = pattern.sub(f'{tag}{keyword}{tag}', result)
    return result


def text_similarity(text1: str, text2: str) -> float:
    """计算文本相似度(简单Jaccard)"""
    words1 = set(re.findall(r'\w+', text1.lower()))
    words2 = set(re.findall(r'\w+', text2.lower()))
    if not words1 or not words2:
        return 0.0
    intersection = words1 & words2
    union = words1 | words2
    return len(intersection) / len(union)


def format_file_size(size_bytes: int) -> str:
    """格式化文件大小"""
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if size_bytes < 1024:
            return f"{size_bytes:.1f}{unit}"
        size_bytes /= 1024
    return f"{size_bytes:.1f}PB"


def parse_duration(duration_str: str) -> int:
    """解析duration字符串为秒"""
    match = re.match(r'(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?', duration_str)
    if not match:
        return 0
    hours = int(match.group(1) or 0)
    minutes = int(match.group(2) or 0)
    seconds = int(match.group(3) or 0)
    return hours * 3600 + minutes * 60 + seconds