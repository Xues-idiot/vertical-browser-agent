"""
Spider - 异常处理模块
定义所有自定义异常类
"""

from typing import Optional, Any, Dict


class SpiderBaseException(Exception):
    """Spider异常基类"""

    def __init__(
        self,
        message: str,
        code: str = "E1000",
        details: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.code = code
        self.details = details or {}
        super().__init__(self.message)

    def to_dict(self) -> dict:
        return {
            "error": self.code,
            "message": self.message,
            "details": self.details,
        }


class SpiderException(SpiderBaseException):
    """Spider基础异常"""
    def __init__(self, message: str, code: str = "E1000", details: Optional[Dict] = None):
        super().__init__(message, code, details)


class JDParseError(SpiderException):
    """JD解析错误"""
    def __init__(self, message: str, details: Optional[Dict] = None):
        super().__init__(f"JD解析失败: {message}", "E2001", details)


class ResumeParseError(SpiderException):
    """简历解析错误"""
    def __init__(self, message: str, details: Optional[Dict] = None):
        super().__init__(f"简历解析失败: {message}", "E2002", details)


class MatchError(SpiderException):
    """匹配评分错误"""
    def __init__(self, message: str, details: Optional[Dict] = None):
        super().__init__(f"匹配评分失败: {message}", "E2003", details)


class ReportGenerationError(SpiderException):
    """报告生成错误"""
    def __init__(self, message: str, details: Optional[Dict] = None):
        super().__init__(f"报告生成失败: {message}", "E2004", details)


class BrowserError(SpiderException):
    """浏览器控制错误"""
    def __init__(self, message: str, details: Optional[Dict] = None):
        super().__init__(f"浏览器操作失败: {message}", "E3001", details)


class ValidationError(SpiderException):
    """数据验证错误"""
    def __init__(self, message: str, field: Optional[str] = None):
        details = {"field": field} if field else {}
        super().__init__(message, "E1001", details)


class APIError(SpiderException):
    """API错误"""
    def __init__(self, message: str, status_code: int = 500, details: Optional[Dict] = None):
        super().__init__(message, "E5001", details)
        self.status_code = status_code


class ConfigurationError(SpiderException):
    """配置错误"""
    def __init__(self, message: str, details: Optional[Dict] = None):
        super().__init__(f"配置错误: {message}", "E1002", details)


class StorageError(SpiderException):
    """存储错误"""
    def __init__(self, message: str, details: Optional[Dict] = None):
        super().__init__(f"存储操作失败: {message}", "E4001", details)


class CompetitorError(SpiderException):
    """竞品监控错误"""
    def __init__(self, message: str, details: Optional[Dict] = None):
        super().__init__(f"竞品操作失败: {message}", "E3002", details)