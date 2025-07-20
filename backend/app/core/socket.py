import socketio
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

# Socket.IOサーバーの作成
sio = socketio.AsyncServer(
    cors_allowed_origins="*",
    logger=True,
    engineio_logger=True
)

# 接続管理
connected_users: Dict[str, str] = {}  # sid -> room_id

@sio.event
async def connect(sid, environ):
    """クライアント接続時の処理"""
    logger.info(f"Client connected: {sid}")
    await sio.emit('connected', {'sid': sid}, room=sid)

@sio.event
async def disconnect(sid):
    """クライアント切断時の処理"""
    logger.info(f"Client disconnected: {sid}")
    if sid in connected_users:
        room_id = connected_users[sid]
        await sio.leave_room(sid, room_id)
        del connected_users[sid]

@sio.event
async def join_room(sid, data):
    """チャットルームに参加"""
    room_id = data.get('room_id')
    if room_id:
        await sio.enter_room(sid, room_id)
        connected_users[sid] = room_id
        await sio.emit('user_joined', {'sid': sid, 'room_id': room_id}, room=room_id)
        logger.info(f"User {sid} joined room {room_id}")

@sio.event
async def leave_room(sid, data):
    """チャットルームから退出"""
    room_id = data.get('room_id')
    if room_id and sid in connected_users:
        await sio.leave_room(sid, room_id)
        del connected_users[sid]
        await sio.emit('user_left', {'sid': sid, 'room_id': room_id}, room=room_id)
        logger.info(f"User {sid} left room {room_id}")

@sio.event
async def send_message(sid, data):
    """メッセージ送信"""
    room_id = data.get('room_id')
    message = data.get('message')
    anonymous_token = data.get('anonymous_token')
    
    if room_id and message:
        message_data = {
            'sid': sid,
            'message': message,
            'anonymous_token': anonymous_token,
            'timestamp': socketio.time()
        }
        await sio.emit('new_message', message_data, room=room_id)
        logger.info(f"Message sent to room {room_id}")

@sio.event
async def typing(sid, data):
    """タイピング状態の送信"""
    room_id = data.get('room_id')
    is_typing = data.get('is_typing', False)
    
    if room_id:
        typing_data = {
            'sid': sid,
            'is_typing': is_typing
        }
        await sio.emit('user_typing', typing_data, room=room_id)

# エラーハンドリング
@sio.event
async def error(sid, data):
    """エラー処理"""
    logger.error(f"Socket.IO error for {sid}: {data}")
    await sio.emit('error', {'message': 'An error occurred'}, room=sid) 