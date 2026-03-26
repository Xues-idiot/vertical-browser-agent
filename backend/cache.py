"""
Spider - 缓存模块
简单的内存缓存实现
"""

import time
import threading
from typing import Any, Optional, Dict, Callable
from dataclasses import dataclass
from functools import wraps


@dataclass
class CacheEntry:
    """缓存条目"""
    value: Any
    expires_at: float
    created_at: float

    def is_expired(self) -> bool:
        return time.time() > self.expires_at


class Cache:
    """简单的内存缓存"""

    def __init__(self, default_ttl: int = 300):
        self._cache: Dict[str, CacheEntry] = {}
        self._lock = threading.RLock()
        self.default_ttl = default_ttl

    def get(self, key: str) -> Optional[Any]:
        """获取缓存值"""
        with self._lock:
            entry = self._cache.get(key)
            if entry is None:
                return None
            if entry.is_expired():
                del self._cache[key]
                return None
            return entry.value

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """设置缓存值"""
        with self._lock:
            ttl = ttl or self.default_ttl
            expires_at = time.time() + ttl
            self._cache[key] = CacheEntry(
                value=value,
                expires_at=expires_at,
                created_at=time.time()
            )

    def delete(self, key: str) -> bool:
        """删除缓存"""
        with self._lock:
            if key in self._cache:
                del self._cache[key]
                return True
            return False

    def clear(self) -> None:
        """清空缓存"""
        with self._lock:
            self._cache.clear()

    def cleanup(self) -> int:
        """清理过期缓存"""
        with self._lock:
            expired_keys = [
                k for k, v in self._cache.items() if v.is_expired()
            ]
            for key in expired_keys:
                del self._cache[key]
            return len(expired_keys)

    def size(self) -> int:
        """缓存大小"""
        with self._lock:
            return len(self._cache)

    def keys(self) -> list:
        """获取所有key"""
        with self._lock:
            return list(self._cache.keys())


# 全局缓存实例
_cache: Optional[Cache] = None


def get_cache() -> Cache:
    """获取全局缓存"""
    global _cache
    if _cache is None:
        _cache = Cache()
    return _cache


def cached(key: str = None, ttl: int = 300):
    """
    缓存装饰器

    用法:
        @cached("my_key", ttl=60)
        def expensive_function():
            pass
    """
    def decorator(func: Callable) -> Callable:
        cache_key = key or f"{func.__module__}.{func.__name__}"

        @wraps(func)
        def wrapper(*args, **kwargs):
            cache = get_cache()
            cache_key_full = f"{cache_key}:{str(args)}:{str(kwargs)}"

            result = cache.get(cache_key_full)
            if result is not None:
                return result

            result = func(*args, **kwargs)
            cache.set(cache_key_full, result, ttl)
            return result

        return wrapper
    return decorator


# LRU缓存
class LRUCache:
    """LRU缓存"""

    def __init__(self, capacity: int = 100):
        self.capacity = capacity
        self._cache: Dict[str, Any] = {}
        self._access_order: list = []
        self._lock = threading.Lock()

    def get(self, key: str) -> Optional[Any]:
        """获取值"""
        with self._lock:
            if key not in self._cache:
                return None
            # Move to end to update LRU order
            try:
                self._access_order.remove(key)
                self._access_order.append(key)
            except ValueError:
                # Key was removed by another thread, return None
                return None
            return self._cache[key]

    def put(self, key: str, value: Any) -> None:
        """放入值"""
        with self._lock:
            # Remove if exists first
            if key in self._cache:
                try:
                    self._access_order.remove(key)
                except ValueError:
                    pass
            # Evict oldest if at capacity
            elif len(self._cache) >= self.capacity:
                if self._access_order:
                    oldest = self._access_order.pop(0)
                    self._cache.pop(oldest, None)

            self._cache[key] = value
            self._access_order.append(key)

    def clear(self) -> None:
        """清空"""
        with self._lock:
            self._cache.clear()
            self._access_order.clear()