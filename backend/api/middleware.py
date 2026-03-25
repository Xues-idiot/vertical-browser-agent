"""
Spider - API中间件
"""

import time
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from backend.logging_config import get_logger

logger = get_logger("api.middleware")


class LoggingMiddleware(BaseHTTPMiddleware):
    """请求日志中间件"""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()

        # 记录请求
        logger.info(f"--> {request.method} {request.url.path}")

        # 处理请求
        response = await call_next(request)

        # 计算耗时
        duration = time.time() - start_time

        # 记录响应
        logger.info(
            f"<-- {request.method} {request.url.path} "
            f"status={response.status_code} duration={duration:.3f}s"
        )

        return response


class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    """错误处理中间件"""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        try:
            return await call_next(request)
        except Exception as exc:
            logger.error(f"Unhandled exception: {exc}", exc_info=True)
            from fastapi.responses import JSONResponse
            return JSONResponse(
                status_code=500,
                content={
                    "status": "error",
                    "message": "Internal server error",
                    "error_code": "INTERNAL_ERROR",
                },
            )