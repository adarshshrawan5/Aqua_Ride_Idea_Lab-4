"""WebSocket connection manager and router for real-time tracking and chat."""

from collections import defaultdict
from typing import Dict, List

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

websocket_router = APIRouter()


class ConnectionManager:
    """Manage active WebSocket connections grouped by room (booking_id)."""

    def __init__(self):
        self._rooms: Dict[str, List[WebSocket]] = defaultdict(list)

    async def connect(self, room: str, websocket: WebSocket):
        await websocket.accept()
        self._rooms[room].append(websocket)

    def disconnect(self, room: str, websocket: WebSocket):
        self._rooms[room].remove(websocket)
        if not self._rooms[room]:
            del self._rooms[room]

    async def broadcast(self, room: str, message: str):
        for connection in list(self._rooms.get(room, [])):
            await connection.send_text(message)


manager = ConnectionManager()


@websocket_router.websocket("/ws/chat/{booking_id}")
async def websocket_chat(websocket: WebSocket, booking_id: int):
    """Real-time chat WebSocket – join room keyed by booking_id."""
    room = f"chat:{booking_id}"
    await manager.connect(room, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(room, data)
    except WebSocketDisconnect:
        manager.disconnect(room, websocket)


@websocket_router.websocket("/ws/tracking/{booking_id}")
async def websocket_tracking(websocket: WebSocket, booking_id: int):
    """Real-time GPS tracking WebSocket – driver sends location, user receives it."""
    room = f"tracking:{booking_id}"
    await manager.connect(room, websocket)
    try:
        while True:
            # Expected JSON: {"latitude": float, "longitude": float}
            data = await websocket.receive_text()
            await manager.broadcast(room, data)
    except WebSocketDisconnect:
        manager.disconnect(room, websocket)
