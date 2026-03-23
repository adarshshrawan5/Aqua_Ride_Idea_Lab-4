"""Real-time GPS tracking WebSocket.

Drivers connect and push JSON: {"lat": <float>, "lon": <float>}
Users tracking a booking connect and receive location broadcasts.

Connection URL:
  ws://host/ws/tracking/{booking_id}?token=<JWT>
"""

import json
import logging
from collections import defaultdict
from typing import Dict, List

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)
router = APIRouter()

# booking_id -> list of connected websockets
_connections: Dict[int, List[WebSocket]] = defaultdict(list)


@router.websocket("/tracking/{booking_id}")
async def tracking_ws(websocket: WebSocket, booking_id: int):
    await websocket.accept()
    _connections[booking_id].append(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            # Broadcast location to all subscribers of this booking
            dead = []
            for ws in _connections[booking_id]:
                try:
                    await ws.send_json({"booking_id": booking_id, **payload})
                except Exception as exc:
                    logger.warning("Failed to send tracking update to client: %s", exc)
                    dead.append(ws)
            for ws in dead:
                _connections[booking_id].remove(ws)
    except WebSocketDisconnect:
        _connections[booking_id].remove(websocket)
