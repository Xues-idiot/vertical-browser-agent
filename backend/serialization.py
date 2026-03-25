"""
Spider - 序列化模块
JSON序列化和反序列化工具
"""

import json
from typing import Any, Optional, Type, TypeVar
from datetime import datetime, date
from decimal import Decimal
from dataclasses import is_dataclass, asdict
from enum import Enum

T = TypeVar('T')


class JSONEncoder(json.JSONEncoder):
    """自定义JSON编码器"""

    def default(self, obj: Any) -> Any:
        if isinstance(obj, datetime):
            return obj.isoformat()
        if isinstance(obj, date):
            return obj.isoformat()
        if isinstance(obj, Decimal):
            return float(obj)
        if isinstance(obj, Enum):
            return obj.value
        if is_dataclass(obj):
            return asdict(obj)
        return super().default(obj)


def to_json(obj: Any, pretty: bool = False, indent: int = 2) -> str:
    """
    对象转JSON字符串

    Args:
        obj: 要序列化的对象
        pretty: 是否美化输出
        indent: 缩进空格数

    Returns:
        JSON字符串
    """
    if pretty:
        return json.dumps(obj, cls=JSONEncoder, indent=indent, ensure_ascii=False)
    return json.dumps(obj, cls=JSONEncoder, ensure_ascii=False)


def from_json(json_str: str, target_type: Optional[Type[T]] = None) -> Any:
    """
    JSON字符串转对象

    Args:
        json_str: JSON字符串
        target_type: 目标类型(可选)

    Returns:
        反序列化后的对象
    """
    data = json.loads(json_str)
    return data


def safe_get(data: dict, *keys: str, default: Any = None) -> Any:
    """
    安全获取嵌套字典值

    Args:
        data: 字典
        *keys: 嵌套键路径
        default: 默认值

    Returns:
        获取的值或默认值
    """
    result = data
    for key in keys:
        if isinstance(result, dict):
            result = result.get(key)
            if result is None:
                return default
        else:
            return default
    return result if result is not None else default


def flatten_dict(data: dict, parent_key: str = '', sep: str = '.') -> dict:
    """扁平化嵌套字典"""
    items = []
    for k, v in data.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep=sep).items())
        else:
            items.append((new_key, v))
    return dict(items)


def unflatten_dict(data: dict, sep: str = '.') -> dict:
    """反扁平化字典"""
    result = {}
    for key, value in data.items():
        parts = key.split(sep)
        current = result
        for part in parts[:-1]:
            if part not in current:
                current[part] = {}
            current = current[part]
        current[parts[-1]] = value
    return result