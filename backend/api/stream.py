"""
Spider - 流式API
用于SSE和流式响应
"""

from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
import asyncio
import json

from backend.api.responses import APIResponse
from backend.sse import get_sse_producer, SSEEventType, ScreeningSSEProducer

router = APIRouter(prefix="/api/stream", tags=["流式API"])


@router.get("/screening/{session_id}")
async def screening_stream(session_id: str):
    """
    筛选流式响应

    使用SSE (Server-Sent Events) 进行流式推送
    """
    sse_producer = get_sse_producer()

    async def event_generator():
        queue = sse_producer.subscribe()

        # 发送连接成功
        yield f"event: connected\ndata: {json.dumps({'session_id': session_id})}\n\n"

        try:
            while True:
                message = await queue.get()
                yield message
        except asyncio.CancelledError:
            sse_producer.unsubscribe(queue)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )


@router.post("/screening/start")
async def start_screening_stream():
    """
    开始筛选（流式）

    返回session_id，用于连接流式端点
    """
    import uuid
    session_id = str(uuid.uuid4())

    return APIResponse.success(
        message="筛选已启动",
        data={
            "session_id": session_id,
            "stream_url": f"/api/stream/screening/{session_id}"
        }
    )


@router.get("/events")
async def events_stream():
    """全局事件流"""
    sse_producer = get_sse_producer()

    async def event_generator():
        queue = sse_producer.subscribe()

        try:
            while True:
                message = await queue.get()
                yield message
        except asyncio.CancelledError:
            sse_producer.unsubscribe(queue)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )