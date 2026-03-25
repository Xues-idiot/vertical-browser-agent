"""
Spider - 事件系统
用于组件间通信和事件处理
"""

from typing import Callable, Dict, List, Any, Optional
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime


class EventType(str, Enum):
    """事件类型"""
    # 筛选相关事件
    SCREENING_STARTED = "screening:started"
    SCREENING_COMPLETED = "screening:completed"
    SCREENING_FAILED = "screening:failed"

    JD_PARSED = "jd:parsed"
    JD_PARSE_FAILED = "jd:parse_failed"

    RESUME_PARSED = "resume:parsed"
    RESUME_PARSE_FAILED = "resume:parse_failed"

    MATCH_COMPLETED = "match:completed"
    MATCH_FAILED = "match:failed"

    REPORT_GENERATED = "report:generated"
    REPORT_GENERATION_FAILED = "report:generation_failed"

    # 竞品相关事件
    COMPETITOR_ADDED = "competitor:added"
    COMPETITOR_REMOVED = "competitor:removed"
    SNAPSHOT_CREATED = "snapshot:created"

    # 浏览器事件
    BROWSER_LAUNCHED = "browser:launched"
    BROWSER_CLOSED = "browser:closed"
    PAGE_LOADED = "page:loaded"

    # 系统事件
    ERROR = "system:error"
    WARNING = "system:warning"


@dataclass
class Event:
    """事件对象"""
    type: EventType
    data: Any = None
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    source: str = "system"

    def to_dict(self) -> dict:
        return {
            "type": self.type.value if isinstance(self.type, EventType) else self.type,
            "data": self.data,
            "timestamp": self.timestamp,
            "source": self.source,
        }


class EventEmitter:
    """事件发射器"""

    def __init__(self):
        self._listeners: Dict[str, List[Callable]] = {}

    def on(self, event: EventType, handler: Callable) -> None:
        """注册事件监听器"""
        event_name = event.value if isinstance(event, EventType) else event
        if event_name not in self._listeners:
            self._listeners[event_name] = []
        self._listeners[event_name].append(handler)

    def off(self, event: EventType, handler: Callable) -> None:
        """移除事件监听器"""
        event_name = event.value if isinstance(event, EventType) else event
        if event_name in self._listeners:
            self._listeners[event_name] = [
                h for h in self._listeners[event_name] if h != handler
            ]

    def emit(self, event: Event) -> None:
        """发射事件"""
        event_name = event.type.value if isinstance(event.type, EventType) else event.type
        if event_name in self._listeners:
            for handler in self._listeners[event_name]:
                try:
                    handler(event)
                except Exception as e:
                    print(f"Event handler error: {e}")

    def once(self, event: EventType, handler: Callable) -> None:
        """单次事件监听"""
        def wrapper(e: Event):
            handler(e)
            self.off(event, wrapper)

        self.on(event, wrapper)


# 全局事件发射器
_global_emitter: Optional[EventEmitter] = None


def get_emitter() -> EventEmitter:
    """获取全局事件发射器"""
    global _global_emitter
    if _global_emitter is None:
        _global_emitter = EventEmitter()
    return _global_emitter


def emit(event: Event) -> None:
    """发射事件（全局）"""
    get_emitter().emit(event)


def on(event: EventType, handler: Callable) -> None:
    """注册事件监听（全局）"""
    get_emitter().on(event, handler)


def off(event: EventType, handler: Callable) -> None:
    """移除事件监听（全局）"""
    get_emitter().off(event, handler)