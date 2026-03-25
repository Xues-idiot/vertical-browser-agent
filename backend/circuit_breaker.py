"""
Spider - 熔断器模块
防止级联失败的熔断器实现
"""

import time
import threading
from enum import Enum
from typing import Callable, Any, Optional
from functools import wraps


class CircuitState(Enum):
    """熔断器状态"""
    CLOSED = "closed"      # 正常关闭
    OPEN = "open"          # 熔断开启
    HALF_OPEN = "half_open"  # 半开状态


class CircuitBreaker:
    """熔断器"""

    def __init__(
        self,
        failure_threshold: int = 5,
        recovery_timeout: int = 60,
        expected_exception: type = Exception
    ):
        self.failure_threshold = failure_threshold  # 失败次数阈值
        self.recovery_timeout = recovery_timeout      # 恢复超时(秒)
        self.expected_exception = expected_exception  # 期望的异常类型

        self.failure_count = 0
        self.last_failure_time: Optional[float] = None
        self.state = CircuitState.CLOSED
        self._lock = threading.Lock()

    def call(self, func: Callable, *args, **kwargs) -> Any:
        """调用函数，带熔断保护"""
        with self._lock:
            if self.state == CircuitState.OPEN:
                if self._should_attempt_reset():
                    self.state = CircuitState.HALF_OPEN
                else:
                    raise Exception("Circuit breaker is OPEN")

            try:
                result = func(*args, **kwargs)
                self._on_success()
                return result
            except self.expected_exception as e:
                self._on_failure()
                raise e

    def _on_success(self) -> None:
        """成功处理"""
        self.failure_count = 0
        self.state = CircuitState.CLOSED

    def _on_failure(self) -> None:
        """失败处理"""
        self.failure_count += 1
        self.last_failure_time = time.time()

        if self.failure_count >= self.failure_threshold:
            self.state = CircuitState.OPEN

    def _should_attempt_reset(self) -> bool:
        """是否应该尝试恢复"""
        if self.last_failure_time is None:
            return True
        return time.time() - self.last_failure_time >= self.recovery_timeout

    def reset(self) -> None:
        """手动重置熔断器"""
        with self._lock:
            self.failure_count = 0
            self.state = CircuitState.CLOSED
            self.last_failure_time = None

    def get_state(self) -> CircuitState:
        """获取当前状态"""
        return self.state


def circuit_breaker(
    failure_threshold: int = 5,
    recovery_timeout: int = 60
):
    """
    熔断器装饰器

    用法:
        @circuit_breaker(failure_threshold=3, recovery_timeout=30)
        def unreliable_function():
            pass
    """
    breaker = CircuitBreaker(failure_threshold, recovery_timeout)

    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            return breaker.call(func, *args, **kwargs)
        return wrapper
    return decorator