"""
Spider - 指标收集模块
用于跟踪和监控性能指标
"""

import time
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from collections import defaultdict
import threading


@dataclass
class Metric:
    """指标数据"""
    name: str
    value: float
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    tags: Dict[str, str] = field(default_factory=dict)


class MetricsCollector:
    """指标收集器"""

    def __init__(self):
        self._metrics: Dict[str, List[float]] = defaultdict(list)
        self._counters: Dict[str, int] = defaultdict(int)
        self._gauges: Dict[str, float] = {}
        self._lock = threading.Lock()

    def increment(self, name: str, value: int = 1, tags: Optional[Dict[str, str]] = None) -> None:
        """递增计数器"""
        with self._lock:
            key = self._make_key(name, tags)
            self._counters[key] += value

    def gauge(self, name: str, value: float, tags: Optional[Dict[str, str]] = None) -> None:
        """设置 gauge 值"""
        with self._lock:
            key = self._make_key(name, tags)
            self._gauges[key] = value

    def histogram(self, name: str, value: float, tags: Optional[Dict[str, str]] = None) -> None:
        """记录直方图值"""
        with self._lock:
            key = self._make_key(name, tags)
            self._metrics[key].append(value)

    def timing(self, name: str, duration_ms: float, tags: Optional[Dict[str, str]] = None) -> None:
        """记录时间"""
        self.histogram(f"{name}.timing", duration_ms, tags)

    def _make_key(self, name: str, tags: Optional[Dict[str, str]]) -> str:
        """生成key"""
        if not tags:
            return name
        tag_str = ",".join(f"{k}={v}" for k, v in sorted(tags.items()))
        return f"{name}[{tag_str}]"

    def get_counter(self, name: str, tags: Optional[Dict[str, str]] = None) -> int:
        """获取计数器值"""
        key = self._make_key(name, tags)
        return self._counters.get(key, 0)

    def get_gauge(self, name: str, tags: Optional[Dict[str, str]] = None) -> Optional[float]:
        """获取gauge值"""
        key = self._make_key(name, tags)
        return self._gauges.get(key)

    def get_histogram_stats(self, name: str, tags: Optional[Dict[str, str]] = None) -> Dict[str, float]:
        """获取直方图统计"""
        key = self._make_key(name, tags)
        values = self._metrics.get(key, [])

        if not values:
            return {"count": 0, "sum": 0, "avg": 0, "min": 0, "max": 0}

        return {
            "count": len(values),
            "sum": sum(values),
            "avg": sum(values) / len(values),
            "min": min(values),
            "max": max(values),
            "p50": sorted(values)[len(values) // 2],
            "p95": sorted(values)[int(len(values) * 0.95)] if len(values) > 1 else values[0],
            "p99": sorted(values)[int(len(values) * 0.99)] if len(values) > 1 else values[0],
        }

    def all_metrics(self) -> Dict[str, Any]:
        """获取所有指标"""
        return {
            "counters": dict(self._counters),
            "gauges": dict(self._gauges),
            "histograms": {
                k: self.get_histogram_stats(k) for k in self._metrics.keys()
            },
        }

    def reset(self) -> None:
        """重置所有指标"""
        with self._lock:
            self._metrics.clear()
            self._counters.clear()
            self._gauges.clear()


# 全局收集器
_metrics_collector: Optional[MetricsCollector] = None


def get_metrics() -> MetricsCollector:
    """获取全局指标收集器"""
    global _metrics_collector
    if _metrics_collector is None:
        _metrics_collector = MetricsCollector()
    return _metrics_collector


# 便捷函数
def increment(name: str, value: int = 1, tags: Optional[Dict] = None) -> None:
    get_metrics().increment(name, value, tags)


def gauge(name: str, value: float, tags: Optional[Dict] = None) -> None:
    get_metrics().gauge(name, value, tags)


def histogram(name: str, value: float, tags: Optional[Dict] = None) -> None:
    get_metrics().histogram(name, value, tags)


def timing(name: str, duration_ms: float, tags: Optional[Dict] = None) -> None:
    get_metrics().timing(name, duration_ms, tags)


class Timer:
    """计时器上下文管理器"""

    def __init__(self, name: str, tags: Optional[Dict] = None):
        self.name = name
        self.tags = tags
        self.start_time: Optional[float] = None

    def __enter__(self):
        self.start_time = time.time()
        return self

    def __exit__(self, *args):
        duration_ms = (time.time() - self.start_time) * 1000
        timing(self.name, duration_ms, self.tags)