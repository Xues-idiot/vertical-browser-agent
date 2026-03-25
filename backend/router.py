"""
Spider - 路由器
用于请求路由和分发
"""

from typing import Callable, Dict, Optional, Any
from dataclasses import dataclass
from enum import Enum
import re


class HTTPMethod(str, Enum):
    """HTTP方法"""
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    DELETE = "DELETE"
    PATCH = "PATCH"
    OPTIONS = "OPTIONS"


@dataclass
class Route:
    """路由"""
    method: HTTPMethod
    path: str
    handler: Callable
    name: Optional[str] = None
    middleware: Optional[list] = None


class Router:
    """路由器"""

    def __init__(self):
        self._routes: list[Route] = []
        self._middleware: list[Callable] = []

    def add_route(
        self,
        method: HTTPMethod,
        path: str,
        handler: Callable,
        name: Optional[str] = None,
        middleware: Optional[list] = None
    ) -> None:
        """添加路由"""
        route = Route(
            method=method,
            path=path,
            handler=handler,
            name=name,
            middleware=middleware
        )
        self._routes.append(route)

    def get(self, path: str, handler: Callable, name: Optional[str] = None) -> None:
        """GET路由"""
        self.add_route(HTTPMethod.GET, path, handler, name)

    def post(self, path: str, handler: Callable, name: Optional[str] = None) -> None:
        """POST路由"""
        self.add_route(HTTPMethod.POST, path, handler, name)

    def put(self, path: str, handler: Callable, name: Optional[str] = None) -> None:
        """PUT路由"""
        self.add_route(HTTPMethod.PUT, path, handler, name)

    def delete(self, path: str, handler: Callable, name: Optional[str] = None) -> None:
        """DELETE路由"""
        self.add_route(HTTPMethod.DELETE, path, handler, name)

    def use(self, middleware: Callable) -> None:
        """添加中间件"""
        self._middleware.append(middleware)

    def match(self, method: str, path: str) -> tuple[Optional[Callable], dict]:
        """匹配路由"""
        for route in self._routes:
            if route.method.value != method:
                continue

            # 简单的路径匹配（支持参数）
            pattern = route.path.replace("{", "(?P<").replace("}", ">[^/]+)")
            pattern = f"^{pattern}$"

            match = re.match(pattern, path)
            if match:
                # 执行中间件
                for mw in self._middleware:
                    if hasattr(mw, '__await__'):
                        # 异步中间件
                        pass
                    else:
                        # 同步中间件
                        result = mw({})
                        if not result:
                            return None, {}

                return route.handler, match.groupdict()

        return None, {}


# 简单的请求上下文
class RequestContext:
    """请求上下文"""

    def __init__(self):
        self.method: str = ""
        self.path: str = ""
        self.params: dict = {}
        self.query: dict = {}
        self.body: Any = None
        self.headers: dict = {}


class Response:
    """响应"""

    def __init__(
        self,
        status_code: int = 200,
        body: Any = None,
        headers: Optional[dict] = None
    ):
        self.status_code = status_code
        self.body = body
        self.headers = headers or {}


# 全局路由器
_router: Optional[Router] = None


def get_router() -> Router:
    """获取全局路由器"""
    global _router
    if _router is None:
        _router = Router()
    return _router