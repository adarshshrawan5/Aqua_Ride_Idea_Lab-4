"""Live chat WebSocket between user and driver.

Both parties connect to the same booking channel and receive each other's messages.

Connection URL:
  ws://host/ws/chat/{booking_id}?token=<JWT>

Incoming message format:  {"sender_id": <int>, "message": "<text>"}
"""

import json
import logging
from collections import defaultdict
from typing import Dict, List

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)
router = APIRouter()

_chat_rooms: Dict[int, List[WebSocket]] = defaultdict(list)


@router.websocket("/chat/{booking_id}")
async def chat_ws(websocket: WebSocket, booking_id: int):
    await websocket.accept()
    _chat_rooms[booking_id].append(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            dead = []
            for ws in _chat_rooms[booking_id]:
                try:
                    await ws.send_json({"booking_id": booking_id, **payload})
                except Exception as exc:
                    logger.warning("Failed to send chat message to client: %s", exc)
                    dead.append(ws)
            for ws in dead:
                _chat_rooms[booking_id].remove(ws)
    except WebSocketDisconnect:
        _chat_rooms[booking_id].remove(websocket)
