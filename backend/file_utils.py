"""
Spider - 文件工具
文件操作、路径处理工具
"""

import os
import json
import hashlib
from pathlib import Path
from typing import Optional, Any, List


def ensure_dir(path: str) -> Path:
    """确保目录存在"""
    p = Path(path)
    p.mkdir(parents=True, exist_ok=True)
    return p


def get_file_hash(filepath: str, algorithm: str = "md5") -> str:
    """计算文件哈希"""
    hash_func = hashlib.new(algorithm)
    with open(filepath, 'rb') as f:
        for chunk in iter(lambda: f.read(4096), b''):
            hash_func.update(chunk)
    return hash_func.hexdigest()


def get_file_size(filepath: str) -> int:
    """获取文件大小(字节)"""
    return Path(filepath).stat().st_size


def get_extension(filepath: str) -> str:
    """获取文件扩展名"""
    return Path(filepath).suffix.lower()


def change_extension(filepath: str, new_ext: str) -> str:
    """更改文件扩展名"""
    p = Path(filepath)
    return str(p.with_suffix(new_ext))


def list_files(
    directory: str,
    pattern: str = "*",
    recursive: bool = False
) -> List[Path]:
    """列出目录下的文件"""
    p = Path(directory)
    if recursive:
        return list(p.rglob(pattern))
    return list(p.glob(pattern))


def read_text_file(filepath: str, encoding: str = "utf-8") -> str:
    """读取文本文件"""
    with open(filepath, 'r', encoding=encoding) as f:
        return f.read()


def write_text_file(
    filepath: str,
    content: str,
    encoding: str = "utf-8"
) -> None:
    """写入文本文件"""
    ensure_dir(os.path.dirname(filepath))
    with open(filepath, 'w', encoding=encoding) as f:
        f.write(content)


def read_json_file(filepath: str) -> Any:
    """读取JSON文件"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def write_json_file(
    filepath: str,
    data: Any,
    indent: int = 2,
    encoding: str = "utf-8"
) -> None:
    """写入JSON文件"""
    ensure_dir(os.path.dirname(filepath))
    with open(filepath, 'w', encoding=encoding) as f:
        json.dump(data, f, indent=indent, ensure_ascii=False)


def safe_filename(filename: str) -> str:
    """获取安全的文件名"""
    import re
    filename = re.sub(r'[^\w\s.-]', '', filename)
    filename = re.sub(r'[-\s]+', '-', filename)
    return filename.strip('-')[:255]


def get_temp_path(prefix: str = "", suffix: str = "") -> str:
    """获取临时文件路径"""
    import tempfile
    import uuid
    temp_dir = tempfile.gettempdir()
    filename = f"{prefix}{uuid.uuid4().hex}{suffix}"
    return os.path.join(temp_dir, filename)