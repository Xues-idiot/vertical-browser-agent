"""
Spider - 装饰器工具
常用装饰器集合
"""

import time
import functools
import threading
from typing import Callable, Any, Optional


def async_timeout(seconds: int):
    """异步超时装饰器"""
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            import asyncio
            try:
                return await asyncio.wait_for(func(*args, **kwargs), timeout=seconds)
            except asyncio.TimeoutError:
                raise TimeoutError(f"{func.__name__} timed out after {seconds}s")
        return wrapper
    return decorator


def sync_timeout(seconds: int):
    """同步超时装饰器"""
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            import signal
            def timeout_handler(signum, frame):
                raise TimeoutError(f"{func.__name__} timed out after {seconds}s")
            signal.signal(signal.SIGALRM, timeout_handler)
            signal.alarm(seconds)
            try:
                result = func(*args, **kwargs)
            finally:
                signal.alarm(0)
            return result
        return wrapper
    return decorator


def memoize(func: Callable) -> Callable:
    """记忆化装饰器"""
    cache = {}
    lock = threading.Lock()

    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        key = str(args) + str(kwargs)
        with lock:
            if key not in cache:
                cache[key] = func(*args, **kwargs)
            return cache[key]

    wrapper.cache_clear = lambda: cache.clear()
    wrapper.cache_info = lambda: {"size": len(cache)}
    return wrapper


def rate_limit(calls: int, period: float):
    """速率限制装饰器"""
    def decorator(func: Callable) -> Callable:
        calls_history = []
        lock = threading.Lock()

        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            now = time.time()
            with lock:
                calls_history[:] = [t for t in calls_history if now - t < period]
                if len(calls_history) >= calls:
                    sleep_time = period - (now - calls_history[0])
                    if sleep_time > 0:
                        time.sleep(sleep_time)
                    now = time.time()
                    calls_history[:] = [t for t in calls_history if now - t < period]
                calls_history.append(now)
            return func(*args, **kwargs)
        return wrapper
    return decorator


def debug(func: Callable) -> Callable:
    """调试装饰器"""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print(f"[DEBUG] {func.__name__} called with args={args}, kwargs={kwargs}")
        try:
            result = func(*args, **kwargs)
            print(f"[DEBUG] {func.__name__} returned {result}")
            return result
        except Exception as e:
            print(f"[DEBUG] {func.__name__} raised {type(e).__name__}: {e}")
            raise
    return wrapper


def deprecated(message: Optional[str] = None) -> Callable:
    """废弃警告装饰器"""
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            msg = message or f"{func.__name__} is deprecated"
            print(f"[DEPRECATED] {msg}")
            return func(*args, **kwargs)
        return wrapper
    return decorator


def singleton(cls: type) -> type:
    """单例模式装饰器"""
    instances = {}
    lock = threading.Lock()

    @functools.wraps(cls)
    def wrapper(*args, **kwargs):
        with lock:
            if cls not in instances:
                instances[cls] = cls(*args, **kwargs)
        return instances[cls]

    wrapper._instance = None
    return wrapper


def log_calls(logger=None):
    """日志记录装饰器"""
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            log = logger or print
            log(f"[CALL] {func.__name__}")
            start = time.time()
            try:
                result = func(*args, **kwargs)
                log(f"[CALL] {func.__name__} completed in {time.time()-start:.3f}s")
                return result
            except Exception as e:
                log(f"[CALL] {func.__name__} failed in {time.time()-start:.3f}s: {e}")
                raise
        return wrapper
    return decorator