"""
Spider - SSE (Server-Sent Events) 支持
用于流式响应和实时推送
"""

import json
import asyncio
from typing import AsyncGenerator, Callable, Optional, Any
from enum import Enum


class SSEEventType(str, Enum):
    """SSE事件类型"""
    MESSAGE = "message"
    PROGRESS = "progress"
    COMPLETE = "complete"
    ERROR = "error"
    HEARTBEAT = "heartbeat"


class SSEProducer:
    """SSE生产者"""

    def __init__(self):
        self._subscribers: list[asyncio.Queue] = []

    def subscribe(self) -> asyncio.Queue:
        """订阅SSE事件"""
        queue = asyncio.Queue()
        self._subscribers.append(queue)
        return queue

    def unsubscribe(self, queue: asyncio.Queue) -> None:
        """取消订阅"""
        if queue in self._subscribers:
            self._subscribers.remove(queue)

    async def publish(self, event_type: SSEEventType, data: Any) -> None:
        """发布事件"""
        event = {
            "type": event_type.value,
            "data": data,
        }
        message = f"event: {event_type.value}\ndata: {json.dumps(data)}\n\n"

        for queue in self._subscribers[:]:
            try:
                await queue.put(message)
            except Exception:
                self._subscribers.remove(queue)

    async def publish_progress(
        self,
        step: str,
        progress: int,
        message: str,
        metadata: Optional[dict] = None
    ) -> None:
        """发布进度事件"""
        data = {
            "step": step,
            "progress": progress,
            "message": message,
        }
        if metadata:
            data["metadata"] = metadata
        await self.publish(SSEEventType.PROGRESS, data)

    async def publish_message(self, message: str, data: Optional[dict] = None) -> None:
        """发布消息事件"""
        payload = {"message": message}
        if data:
            payload.update(data)
        await self.publish(SSEEventType.MESSAGE, payload)

    async def publish_error(self, error: str, code: Optional[str] = None) -> None:
        """发布错误事件"""
        data = {"error": error}
        if code:
            data["code"] = code
        await self.publish(SSEEventType.ERROR, data)

    async def publish_complete(self, data: Optional[dict] = None) -> None:
        """发布完成事件"""
        await self.publish(SSEEventType.COMPLETE, data or {})


async def sse_response(
    producer: SSEProducer,
    event_type: SSEEventType = SSEEventType.MESSAGE
) -> AsyncGenerator[str, None]:
    """SSE响应生成器"""
    queue = producer.subscribe()

    try:
        while True:
            message = await queue.get()
            yield message
    except GeneratorExit:
        producer.unsubscribe(queue)


async def sse_heartbeat(producer: SSEProducer, interval: int = 30) -> None:
    """SSE心跳"""
    while True:
        await asyncio.sleep(interval)
        await producer.publish(SSEEventType.HEARTBEAT, {"timestamp": asyncio.get_event_loop().time()})


class ScreeningSSEProducer(SSEProducer):
    """筛选专用SSE生产者"""

    async def emit_parsing_jd(self, jd_info: dict) -> None:
        """JD解析完成"""
        await self.publish_progress(
            step="parsing_jd",
            progress=25,
            message="JD解析完成",
            metadata=jd_info
        )

    async def emit_parsing_resumes(self, count: int) -> None:
        """简历解析中"""
        await self.publish_progress(
            step="parsing_resumes",
            progress=50,
            message=f"已解析 {count} 份简历"
        )

    async def emit_matching(self, index: int, total: int) -> None:
        """匹配中"""
        progress = 50 + int((index / total) * 30)
        await self.publish_progress(
            step="matching",
            progress=progress,
            message=f"匹配中 {index}/{total}"
        )

    async def emit_generating_report(self) -> None:
        """生成报告中"""
        await self.publish_progress(
            step="generating_report",
            progress=90,
            message="正在生成报告..."
        )

    async def emit_complete(self, report: dict) -> None:
        """完成"""
        await self.publish_complete({"report": report})


# 全局SSE生产者
_sse_producer: Optional[ScreeningSSEProducer] = None


def get_sse_producer() -> ScreeningSSEProducer:
    """获取全局SSE生产者"""
    global _sse_producer
    if _sse_producer is None:
        _sse_producer = ScreeningSSEProducer()
    return _sse_producer