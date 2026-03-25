"""
Spider - 数据验证模块
用于验证输入数据的有效性
"""

import re
from typing import Optional, Any, Callable
from dataclasses import dataclass
from functools import wraps


class ValidationError(Exception):
    """验证错误异常"""

    def __init__(self, message: str, field: Optional[str] = None, code: str = "VALIDATION_ERROR"):
        self.message = message
        self.field = field
        self.code = code
        super().__init__(self.message)


@dataclass
class ValidationResult:
    """验证结果"""
    is_valid: bool
    error: Optional[str] = None
    field: Optional[str] = None

    @property
    def ok(self) -> bool:
        return self.is_valid


class Validator:
    """数据验证器基类"""

    @staticmethod
    def validate_jd_text(text: str) -> ValidationResult:
        """
        验证JD文本

        Returns:
            ValidationResult
        """
        if not text or not text.strip():
            return ValidationResult(False, "JD文本不能为空", "jd_text")

        if len(text) < 50:
            return ValidationResult(False, "JD文本太短，至少需要50个字符", "jd_text")

        if len(text) > 50000:
            return ValidationResult(False, "JD文本太长，最多50000个字符", "jd_text")

        return ValidationResult(True)

    @staticmethod
    def validate_resume_text(text: str) -> ValidationResult:
        """
        验证简历文本

        Returns:
            ValidationResult
        """
        if not text or not text.strip():
            return ValidationResult(False, "简历文本不能为空", "resume_text")

        if len(text) < 20:
            return ValidationResult(False, "简历文本太短，至少需要20个字符", "resume_text")

        if len(text) > 100000:
            return ValidationResult(False, "简历文本太长，最多100000个字符", "resume_text")

        return ValidationResult(True)

    @staticmethod
    def validate_url(url: str, require_https: bool = False) -> ValidationResult:
        """
        验证URL格式

        Args:
            url: URL字符串
            require_https: 是否强制HTTPS

        Returns:
            ValidationResult
        """
        if not url or not url.strip():
            return ValidationResult(False, "URL不能为空", "url")

        # 简单的URL格式验证
        pattern = r'^https://' if require_https else r'^https?://'
        pattern += r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'
        pattern += r'localhost|'
        pattern += r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'
        pattern += r'(?::\d+)?'
        pattern += r'(?:/?|[/?]\S+)$'

        if not re.compile(pattern, re.IGNORECASE).match(url):
            return ValidationResult(False, "URL格式不正确", "url")

        return ValidationResult(True)

    @staticmethod
    def validate_email(email: str, required: bool = False) -> ValidationResult:
        """
        验证邮箱格式

        Args:
            email: 邮箱字符串
            required: 是否必填

        Returns:
            ValidationResult
        """
        if not email:
            if required:
                return ValidationResult(False, "邮箱不能为空", "email")
            return ValidationResult(True)

        email_pattern = re.compile(r'^[\w\.-]+@[\w\.-]+\.\w+$')
        if not email_pattern.match(email):
            return ValidationResult(False, "邮箱格式不正确", "email")

        return ValidationResult(True)

    @staticmethod
    def validate_phone(phone: str, required: bool = False) -> ValidationResult:
        """
        验证手机号格式（中国大陆）

        Args:
            phone: 手机号字符串
            required: 是否必填

        Returns:
            ValidationResult
        """
        if not phone:
            if required:
                return ValidationResult(False, "手机号不能为空", "phone")
            return ValidationResult(True)

        # 中国大陆手机号格式
        phone_pattern = re.compile(r'^1[3-9]\d{9}$')
        if not phone_pattern.match(phone):
            return ValidationResult(False, "手机号格式不正确", "phone")

        return ValidationResult(True)

    @staticmethod
    def validate_experience_years(years: int, min_age: int = 0, max_age: int = 50) -> ValidationResult:
        """
        验证工作年限

        Args:
            years: 工作年限
            min_age: 最小年限
            max_age: 最大年限

        Returns:
            ValidationResult
        """
        if years < min_age:
            return ValidationResult(False, f"工作年限不能少于{min_age}年", "years_experience")

        if years > max_age:
            return ValidationResult(False, f"工作年限超出合理范围(最多{max_age}年)", "years_experience")

        return ValidationResult(True)

    @staticmethod
    def validate_score(score: float, min_score: float = 0, max_score: float = 100) -> ValidationResult:
        """
        验证评分

        Args:
            score: 评分
            min_score: 最小评分
            max_score: 最大评分

        Returns:
            ValidationResult
        """
        if score < min_score or score > max_score:
            return ValidationResult(False, f"评分必须在{min_score}-{max_score}之间", "score")

        return ValidationResult(True)

    @staticmethod
    def validate_string_length(
        value: str,
        min_length: int = 0,
        max_length: int = 1000,
        field_name: str = "value"
    ) -> ValidationResult:
        """
        验证字符串长度

        Args:
            value: 字符串值
            min_length: 最小长度
            max_length: 最大长度
            field_name: 字段名

        Returns:
            ValidationResult
        """
        if not value:
            return ValidationResult(False, f"{field_name}不能为空", field_name)

        length = len(value)
        if length < min_length:
            return ValidationResult(False, f"{field_name}太短，至少{min_length}个字符", field_name)

        if length > max_length:
            return ValidationResult(False, f"{field_name}太长，最多{max_length}个字符", field_name)

        return ValidationResult(True)

    @staticmethod
    def validate_enum(value: Any, allowed_values: list, field_name: str = "value") -> ValidationResult:
        """
        验证枚举值

        Args:
            value: 值
            allowed_values: 允许的值列表
            field_name: 字段名

        Returns:
            ValidationResult
        """
        if value not in allowed_values:
            return ValidationResult(
                False,
                f"{field_name}必须是以下值之一: {', '.join(str(v) for v in allowed_values)}",
                field_name
            )
        return ValidationResult(True)

    @staticmethod
    def validate_list_length(
        value: list,
        min_length: int = 0,
        max_length: int = 100,
        field_name: str = "list"
    ) -> ValidationResult:
        """
        验证列表长度

        Args:
            value: 列表
            min_length: 最小长度
            max_length: 最大长度
            field_name: 字段名

        Returns:
            ValidationResult
        """
        if not value:
            if min_length > 0:
                return ValidationResult(False, f"{field_name}不能为空", field_name)
            return ValidationResult(True)

        length = len(value)
        if length < min_length:
            return ValidationResult(False, f"{field_name}太短，至少{min_length}项", field_name)

        if length > max_length:
            return ValidationResult(False, f"{field_name}太多，最多{max_length}项", field_name)

        return ValidationResult(True)


def validate(**validation_rules):
    """
    验证装饰器

    用法:
        @validate(
        )
        async def my_endpoint(request: MyRequest):
            pass
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # 这里可以添加参数验证逻辑
            return await func(*args, **kwargs)
        return wrapper
    return decorator


class SchemaValidator:
    """Schema验证器 - 用于复杂对象验证"""

    def __init__(self, schema: dict):
        self.schema = schema

    def validate(self, data: dict) -> tuple[bool, list[ValidationResult]]:
        """
        验证数据是否符合schema

        Args:
            data: 要验证的数据

        Returns:
            (is_valid, errors)
        """
        errors = []

        for field, rules in self.schema.items():
            value = data.get(field)

            # 必填检查
            if rules.get("required", False) and not value:
                errors.append(ValidationResult(False, f"{field}不能为空", field))
                continue

            # 类型检查
            expected_type = rules.get("type")
            if value and expected_type and not isinstance(value, expected_type):
                errors.append(ValidationResult(False, f"{field}类型错误", field))
                continue

            # 自定义验证函数
            validator = rules.get("validator")
            if validator and value:
                result = validator(value)
                if not result.ok:
                    errors.append(result)
                    continue

        return len(errors) == 0, errors