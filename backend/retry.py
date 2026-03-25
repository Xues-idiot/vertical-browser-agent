"""
Spider - 重试模块
带指数退避的重试装饰器
"""

import time
import random
import threading
from typing import Callable, Any, Optional, Tuple, Type
from functools import wraps


def retry(
    max_attempts: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 60.0,
    exponential_base: float = 2.0,
    jitter: bool = True,
    exceptions: Tuple[Type[Exception], ...] = (Exception,)
):
    """
    重试装饰器

    Args:
        max_attempts: 最大尝试次数
        base_delay: 基础延迟(秒)
        max_delay: 最大延迟(秒)
        exponential_base: 指数基数
        jitter: 是否添加随机抖动
        exceptions: 需要重试的异常类型

    用法:
        @retry(max_attempts=3, base_delay=1)
        def unstable_function():
            pass
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            last_exception = None

            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e

                    if attempt == max_attempts - 1:
                        raise

                    # 计算延迟
                    delay = min(base_delay * (exponential_base ** attempt), max_delay)

                    # 添加随机抖动
                    if jitter:
                        delay = delay * (0.5 + random.random())

                    print(f"Retry attempt {attempt + 1}/{max_attempts} after {delay:.2f}s: {e}")

                    time.sleep(delay)

            raise last_exception

        return wrapper
    return decorator


class RetryContext:
    """重试上下文"""

    def __init__(
        self,
        max_attempts: int = 3,
        base_delay: float = 1.0,
        max_delay: float = 60.0
    ):
        self.max_attempts = max_attempts
        self.base_delay = base_delay
        self.max_delay = max_delay
        self.attempt = 0
        self.last_error: Optional[Exception] = None

    def __enter__(self):
        self.attempt += 1
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            self.last_error = exc_val
            return False
        return True

    def should_retry(self) -> bool:
        """是否应该重试"""
        return self.attempt < self.max_attempts

    def get_delay(self) -> float:
        """获取延迟时间"""
        import math
        delay = self.base_delay * math.pow(2, self.attempt - 1)
        return min(delay, self.max_delay)


def retry_with_context(
    func: Callable,
    max_attempts: int = 3,
    base_delay: float = 1.0,
    exceptions: Tuple[Type[Exception], ...] = (Exception,)
) -> Any:
    """
    使用上下文管理器的重试

    用法:
        result = retry_with_context(
            unstable_function,
            max_attempts=3,
            exceptions=(ConnectionError, TimeoutError)
        )
    """
    last_error = None

    for attempt in range(max_attempts):
        try:
            return func()
        except exceptions as e:
            last_error = e
            if attempt < max_attempts - 1:
                delay = base_delay * (2 ** attempt)
                time.sleep(delay)

    if last_error:
        raise last_error