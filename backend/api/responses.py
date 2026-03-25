"""
Spider - API响应模型
统一的API响应格式和错误处理
"""

from typing import Optional, Any, Generic, TypeVar
from dataclasses import dataclass, field
from enum import Enum

T = TypeVar("T")


class ResponseStatus(str, Enum):
    """响应状态"""
    SUCCESS = "success"
    ERROR = "error"
    PARTIAL = "partial"  # 部分成功
    LOADING = "loading"  # 加载中


class ErrorCode(str, Enum):
    """错误代码"""
    # 通用错误 (1000-1999)
    UNKNOWN_ERROR = "E1000"
    VALIDATION_ERROR = "E1001"
    NOT_FOUND = "E1002"
    UNAUTHORIZED = "E1003"
    FORBIDDEN = "E1004"
    TIMEOUT = "E1005"
    RATE_LIMIT = "E1006"

    # 筛选相关错误 (2000-2999)
    JD_PARSE_ERROR = "E2001"
    RESUME_PARSE_ERROR = "E2002"
    MATCH_ERROR = "E2003"
    REPORT_GENERATION_ERROR = "E2004"

    # 竞品相关错误 (3000-3999)
    COMPETITOR_NOT_FOUND = "E3001"
    SNAPSHOT_ERROR = "E3002"


@dataclass
class APIError:
    """API错误详情"""
    code: ErrorCode
    message: str
    field: Optional[str] = None
    details: Optional[dict] = None

    def to_dict(self) -> dict:
        result = {
            "code": self.code.value,
            "message": self.message,
        }
        if self.field:
            result["field"] = self.field
        if self.details:
            result["details"] = self.details
        return result


@dataclass
class APIResponse:
    """API响应"""
    status: ResponseStatus
    message: str
    data: Optional[Any] = None
    error: Optional[APIError] = None
    request_id: Optional[str] = None
    timestamp: Optional[str] = None

    def to_dict(self) -> dict:
        """转换为字典"""
        result = {
            "success": self.status == ResponseStatus.SUCCESS,
            "status": self.status.value,
            "message": self.message,
        }
        if self.data is not None:
            result["data"] = self.data
        if self.error:
            result["error"] = self.error.to_dict()
        if self.request_id:
            result["request_id"] = self.request_id
        if self.timestamp:
            result["timestamp"] = self.timestamp
        return result

    @staticmethod
    def success(
        message: str = "操作成功",
        data: Any = None,
        request_id: Optional[str] = None
    ) -> "APIResponse":
        """成功响应"""
        from datetime import datetime
        return APIResponse(
            status=ResponseStatus.SUCCESS,
            message=message,
            data=data,
            request_id=request_id,
            timestamp=datetime.now().isoformat(),
        )

    @staticmethod
    def error(
        message: str,
        code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
        field: Optional[str] = None,
        details: Optional[dict] = None,
        request_id: Optional[str] = None
    ) -> "APIResponse":
        """错误响应"""
        from datetime import datetime
        return APIResponse(
            status=ResponseStatus.ERROR,
            message=message,
            error=APIError(
                code=code,
                message=message,
                field=field,
                details=details,
            ),
            request_id=request_id,
            timestamp=datetime.now().isoformat(),
        )

    @staticmethod
    def partial(
        message: str,
        data: Any = None,
        request_id: Optional[str] = None
    ) -> "APIResponse":
        """部分成功响应"""
        from datetime import datetime
        return APIResponse(
            status=ResponseStatus.PARTIAL,
            message=message,
            data=data,
            request_id=request_id,
            timestamp=datetime.now().isoformat(),
        )


@dataclass
class PaginatedResponse:
    """分页响应"""
    items: list
    total: int
    page: int
    page_size: int
    total_pages: int

    def to_dict(self) -> dict:
        """转换为字典"""
        return {
            "items": self.items,
            "pagination": {
                "total": self.total,
                "page": self.page,
                "page_size": self.page_size,
                "total_pages": self.total_pages,
                "has_next": self.page < self.total_pages,
                "has_prev": self.page > 1,
            }
        }


@dataclass
class ListResponse:
    """列表响应"""
    items: list
    total: int

    def to_dict(self) -> dict:
        """转换为字典"""
        return {
            "items": self.items,
            "total": self.total,
            "count": len(self.items),
        }


@dataclass
class StreamResponse:
    """流式响应"""
    event: str
    data: Any
    step: Optional[str] = None
    progress: Optional[int] = None

    def to_dict(self) -> dict:
        """转换为字典"""
        result = {
            "event": self.event,
            "data": self.data,
        }
        if self.step:
            result["step"] = self.step
        if self.progress is not None:
            result["progress"] = self.progress
        return result

    def to_sse(self) -> str:
        """转换为Server-Sent Events格式"""
        import json
        return f"event: {self.event}\ndata: {json.dumps(self.data)}\n\n"


def success_response(message: str = "操作成功", data: Any = None):
    """快捷成功响应"""
    return APIResponse.success(message, data)


def error_response(
    message: str,
    code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
    **kwargs
):
    """快捷错误响应"""
    return APIResponse.error(message, code, **kwargs)


def paginate(items: list, page: int, page_size: int) -> PaginatedResponse:
    """分页辅助函数"""
    total = len(items)
    start = (page - 1) * page_size
    end = start + page_size
    paginated_items = items[start:end]
    total_pages = (total + page_size - 1) // page_size

    return PaginatedResponse(
        items=paginated_items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )