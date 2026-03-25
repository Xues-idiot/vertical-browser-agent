"""
Spider - 限流模块
简单的令牌桶限流实现
"""

import time
import threading
from typing import Dict, Optional


class TokenBucket:
    """令牌桶限流器"""

    def __init__(self, rate: float, capacity: int):
        self.rate = rate  # 每秒补充的令牌数
        self.capacity = capacity  # 桶容量
        self.tokens = capacity
        self.last_update = time.time()
        self._lock = threading.Lock()

    def consume(self, tokens: int = 1) -> bool:
        """尝试消费令牌"""
        with self._lock:
            self._refill()

            if self.tokens >= tokens:
                self.tokens -= tokens
                return True
            return False

    def _refill(self) -> None:
        """补充令牌"""
        now = time.time()
        elapsed = now - self.last_update
        new_tokens = elapsed * self.rate
        self.tokens = min(self.capacity, self.tokens + new_tokens)
        self.last_update = now


class RateLimiter:
    """限流器"""

    def __init__(self, rate: int = 60, capacity: int = 60):
        """
        Args:
            rate: 每秒允许的请求数
            capacity: 桶容量
        """
        self._buckets: Dict[str, TokenBucket] = {}
        self.default_bucket = TokenBucket(rate, capacity)
        self._lock = threading.Lock()

    def get_bucket(self, key: str, rate: Optional[int] = None, capacity: Optional[int] = None) -> TokenBucket:
        """获取指定key的bucket"""
        with self._lock:
            if key not in self._buckets:
                self._buckets[key] = TokenBucket(
                    rate or self.default_bucket.rate,
                    capacity or self.default_bucket.capacity
                )
            return self._buckets[key]

    def allow_request(self, key: str = "default", tokens: int = 1) -> bool:
        """检查是否允许请求"""
        bucket = self.get_bucket(key)
        return bucket.consume(tokens)

    def cleanup(self) -> None:
        """清理过期bucket"""
        with self._lock:
            # 清理空bucket
            self._buckets = {
                k: v for k, v in self._buckets.items()
                if v.tokens < v.capacity
            }


# 全局限流器
_limiter: Optional[RateLimiter] = None


def get_limiter() -> RateLimiter:
    """获取全局限流器"""
    global _limiter
    if _limiter is None:
        _limiter = RateLimiter(rate=60, capacity=60)
    return _limiter


def rate_limit(key: str = "default", tokens: int = 1) -> bool:
    """检查限流"""
    return get_limiter().allow_request(key, tokens)