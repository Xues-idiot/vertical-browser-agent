"""
Spider - WebSocket支持
用于实时双向通信
"""

import json
import asyncio
from typing import Set, Optional, Dict, Any, Callable
from dataclasses import dataclass
from datetime import datetime
from enum import Enum


class WSMessageType(str, Enum):
    """WebSocket消息类型"""
    TEXT = "text"
    BINARY = "binary"
    JSON = "json"
    PING = "ping"
    PONG = "pong"
    SUBSCRIBE = "subscribe"
    UNSUBSCRIBE = "unsubscribe"


@dataclass
class WSMessage:
    """WebSocket消息"""
    type: WSMessageType
    data: Any
    timestamp: str
    client_id: Optional[str] = None

    def to_dict(self) -> dict:
        return {
            "type": self.type.value,
            "data": self.data,
            "timestamp": self.timestamp,
            "client_id": self.client_id,
        }


class WebSocketManager:
    """WebSocket连接管理器"""

    def __init__(self):
        self._connections: Dict[str, Set] = {}
        self._handlers: Dict[str, Callable] = {}
        self._lock = asyncio.Lock()

    async def connect(self, client_id: str, websocket) -> None:
        """连接"""
        async with self._lock:
            if client_id not in self._connections:
                self._connections[client_id] = set()
            self._connections[client_id].add(websocket)

    async def disconnect(self, client_id: str, websocket) -> None:
        """断开连接"""
        async with self._lock:
            if client_id in self._connections:
                self._connections[client_id].discard(websocket)
                if not self._connections[client_id]:
                    del self._connections[client_id]

    async def send(self, client_id: str, message: WSMessage) -> None:
        """发送消息"""
        if client_id not in self._connections:
            return

        for websocket in self._connections[client_id].copy():
            try:
                if message.type == WSMessageType.JSON:
                    await websocket.send_json(message.to_dict())
                else:
                    await websocket.send_text(message.data)
            except Exception:
                self._connections[client_id].discard(websocket)

    async def broadcast(self, message: WSMessage, channel: Optional[str] = None) -> None:
        """广播消息"""
        if channel:
            # 发送到特定频道
            target_clients = {channel}
        else:
            # 广播到所有客户端
            target_clients = self._connections.keys()

        for client_id in target_clients:
            await self.send(client_id, message)

    async def broadcast_to_channel(self, channel: str, message: WSMessage) -> None:
        """广播到频道"""
        await self.broadcast(message, channel)

    def register_handler(self, message_type: str, handler: Callable) -> None:
        """注册消息处理器"""
        self._handlers[message_type] = handler

    async def handle_message(self, client_id: str, message: dict) -> None:
        """处理消息"""
        message_type = message.get("type")
        if message_type in self._handlers:
            handler = self._handlers[message_type]
            await handler(client_id, message.get("data", {}))

    @property
    def client_count(self) -> int:
        """客户端数量"""
        return len(self._connections)

    @property
    def connection_count(self) -> int:
        """连接数量"""
        return sum(len(conns) for conns in self._connections.values())


# 全局管理器
_ws_manager: Optional[WebSocketManager] = None


def get_ws_manager() -> WebSocketManager:
    """获取全局WebSocket管理器"""
    global _ws_manager
    if _ws_manager is None:
        _ws_manager = WebSocketManager()
    return _ws_manager