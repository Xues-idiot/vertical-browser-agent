"""
Spider - 日期时间工具
日期解析、格式化、计算工具
"""

from datetime import datetime, timedelta, date
from typing import Optional, Union
import time


def now() -> datetime:
    """获取当前时间"""
    return datetime.now()


def today() -> date:
    """获取今天的日期"""
    return datetime.now().date()


def timestamp() -> float:
    """获取当前时间戳"""
    return time.time()


def to_datetime(dt: Union[str, datetime, date]) -> Optional[datetime]:
    """转换为datetime"""
    if isinstance(dt, datetime):
        return dt
    if isinstance(dt, date):
        return datetime.combine(dt, datetime.min.time())
    if isinstance(dt, str):
        try:
            # 尝试ISO格式
            return datetime.fromisoformat(dt.replace('Z', '+00:00'))
        except ValueError:
            try:
                # 尝试常见格式
                return datetime.strptime(dt, '%Y-%m-%d %H:%M:%S')
            except ValueError:
                try:
                    return datetime.strptime(dt, '%Y-%m-%d')
                except ValueError:
                    return None
    return None


def format_datetime(
    dt: Union[datetime, date, str],
    format_str: str = '%Y-%m-%d %H:%M:%S'
) -> str:
    """格式化日期时间"""
    if isinstance(dt, str):
        dt = to_datetime(dt) or datetime.now()
    if isinstance(dt, date):
        dt = datetime.combine(dt, datetime.min.time())
    return dt.strftime(format_str)


def format_relative(dt: Union[datetime, str]) -> str:
    """格式化为相对时间"""
    if isinstance(dt, str):
        dt = to_datetime(dt) or datetime.now()

    now_dt = datetime.now()
    diff = now_dt - dt

    seconds = diff.total_seconds()
    if seconds < 60:
        return f"{int(seconds)}秒前"
    if seconds < 3600:
        return f"{int(seconds / 60)}分钟前"
    if seconds < 86400:
        return f"{int(seconds / 3600)}小时前"
    if seconds < 604800:
        return f"{int(seconds / 86400)}天前"
    if seconds < 2592000:
        return f"{int(seconds / 604800)}周前"
    if seconds < 31536000:
        return f"{int(seconds / 2592000)}月前"
    return f"{int(seconds / 31536000)}年前"


def parse_duration(duration_str: str) -> timedelta:
    """解析duration字符串"""
    match = re.match(r'(?:(\d+)d)?(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?', duration_str)
    if not match:
        return timedelta()

    days = int(match.group(1) or 0)
    hours = int(match.group(2) or 0)
    minutes = int(match.group(3) or 0)
    seconds = int(match.group(4) or 0)

    return timedelta(days=days, hours=hours, minutes=minutes, seconds=seconds)


def is_business_day(dt: Union[datetime, date]) -> bool:
    """判断是否为工作日"""
    if isinstance(dt, datetime):
        dt = dt.date()
    return dt.weekday() < 5


def next_business_day(dt: Optional[Union[datetime, date]] = None) -> date:
    """获取下一个工作日"""
    if dt is None:
        dt = today()
    elif isinstance(dt, datetime):
        dt = dt.date()

    next_day = dt + timedelta(days=1)
    while not is_business_day(next_day):
        next_day += timedelta(days=1)
    return next_day


import re