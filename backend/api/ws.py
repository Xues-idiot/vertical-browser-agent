"""
Spider - WebSocket API
实时双向通信接口
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Optional
import json
import asyncio

from backend.api.responses import APIResponse

router = APIRouter(tags=["WebSocket"])


class ConnectionManager:
    """连接管理器"""

    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        """连接"""
        await websocket.accept()
        self.active_connections[client_id] = websocket
        await self.broadcast_count()

    def disconnect(self, client_id: str):
        """断开"""
        if client_id in self.active_connections:
            del self.active_connections[client_id]

    async def send_personal(self, websocket: WebSocket, message: dict):
        """发送个人消息"""
        await websocket.send_json(message)

    async def broadcast(self, message: dict):
        """广播"""
        for connection in self.active_connections.values():
            await connection.send_json(message)

    async def broadcast_count(self):
        """广播连接数"""
        await self.broadcast({
            "type": "system",
            "event": "count_update",
            "data": {"count": len(self.active_connections)}
        })


manager = ConnectionManager()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, client_id: Optional[str] = None):
    """WebSocket端点"""
    client_id = client_id or f"client_{id(websocket)}"
    await manager.connect(websocket, client_id)

    try:
        # 发送连接成功消息
        await manager.send_personal(websocket, {
            "type": "system",
            "event": "connected",
            "data": {"client_id": client_id}
        })

        # 消息循环
        while True:
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
            except json.JSONDecodeError:
                await manager.send_personal(websocket, {
                    "type": "error",
                    "event": "invalid_json",
                    "data": {"message": "Invalid JSON format"}
                })
                continue
            except Exception as e:
                await manager.send_personal(websocket, {
                    "type": "error",
                    "event": "message_error",
                    "data": {"message": str(e)}
                })
                continue

            # 处理消息
            msg_type = message.get("type")
            msg_data = message.get("data", {})

            if msg_type == "ping":
                await manager.send_personal(websocket, {
                    "type": "pong",
                    "data": {}
                })
            elif msg_type == "subscribe":
                # 订阅频道
                channel = msg_data.get("channel")
                await manager.send_personal(websocket, {
                    "type": "subscribed",
                    "data": {"channel": channel}
                })
            elif msg_type == "broadcast":
                # 广播消息
                await manager.broadcast({
                    "type": "broadcast",
                    "data": msg_data
                })

    except WebSocketDisconnect:
        manager.disconnect(client_id)
        await manager.broadcast_count()


@router.get("/ws/status")
async def ws_status():
    """WebSocket状态"""
    return APIResponse.success(
        data={
            "active_connections": len(manager.active_connections),
            "enabled": True
        }
    )