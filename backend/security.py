"""
Spider - 安全模块
输入清理和安全相关功能
"""

import re
import html
from typing import Optional, Any
from dataclasses import dataclass


@dataclass
class SanitizedText:
    """清理后的文本"""
    text: str
    is_safe: bool
    removed_chars: int = 0


class SecurityUtils:
    """安全工具类"""

    # 危险字符模式
    DANGEROUS_PATTERNS = [
        (r'<script[^>]*>.*?</script>', 'script'),
        (r'javascript:', 'javascript'),
        (r'on\w+\s*=', 'event_handler'),
        (r'<iframe[^>]*>.*?</iframe>', 'iframe'),
        (r'<object[^>]*>.*?</object>', 'object'),
        (r'<embed[^>]*>', 'embed'),
    ]

    @staticmethod
    def sanitize_html(text: str) -> SanitizedText:
        """清理HTML标签"""
        removed_count = 0
        cleaned = text

        for pattern, name in SecurityUtils.DANGEROUS_PATTERNS:
            matches = len(re.findall(pattern, cleaned, re.IGNORECASE | re.DOTALL))
            if matches > 0:
                removed_count += matches
                cleaned = re.sub(pattern, '', cleaned, flags=re.IGNORECASE | re.DOTALL)

        # 转义剩余的HTML实体
        cleaned = html.escape(cleaned)

        return SanitizedText(
            text=cleaned.strip(),
            is_safe=removed_count == 0,
            removed_chars=removed_count
        )

    @staticmethod
    def sanitize_sql(text: str) -> str:
        """简单的SQL注入防护"""
        if not text:
            return text

        # 移除危险SQL关键字组合
        dangerous = ["'", '"', ';', '--', '/*', '*/', 'xp_', 'sp_']
        for d in dangerous:
            text = text.replace(d, '')

        return text

    @staticmethod
    def validate_input(
        text: str,
        max_length: int = 10000,
        allow_html: bool = False
    ) -> tuple[bool, Optional[str]]:
        """
        验证输入

        Returns:
            (is_valid, error_message)
        """
        if not text:
            return False, "输入不能为空"

        if len(text) > max_length:
            return False, f"输入超过最大长度({max_length})"

        if not allow_html:
            result = SecurityUtils.sanitize_html(text)
            if not result.is_safe:
                return False, "输入包含不允许的内容"

        return True, None

    @staticmethod
    def mask_sensitive(text: str, visible_chars: int = 4) -> str:
        """遮蔽敏感信息"""
        if not text or len(text) <= visible_chars:
            return '*' * len(text) if text else ''

        return text[:visible_chars] + '*' * (len(text) - visible_chars)

    @staticmethod
    def generate_token(length: int = 32) -> str:
        """生成随机令牌"""
        import secrets
        return secrets.token_urlsafe(length)


class InputValidator:
    """输入验证器"""

    @staticmethod
    def is_safe_text(text: str) -> bool:
        """检查文本是否安全"""
        if not text:
            return True

        dangerous_chars = ['<', '>', '"', "'", '&', ';', '\\']
        return not any(c in text for c in dangerous_chars)

    @staticmethod
    def clean_filename(filename: str) -> str:
        """清理文件名"""
        # 移除路径分隔符
        filename = filename.replace('/', '').replace('\\', '')
        # 只保留字母、数字、下划线、点和连字符
        filename = re.sub(r'[^\w.\-]', '_', filename)
        return filename[:255]  # 限制长度

    @staticmethod
    def validate_email(email: str) -> bool:
        """验证邮箱格式"""
        if not email:
            return False
        pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
        return bool(re.match(pattern, email))