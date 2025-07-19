import socketio
import logging
from app.core.config import settings

# ログ設定
logger = logging.getLogger(__name__)

# Socket.ioサーバー
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=settings.ALLOWED_ORIGINS
)

# Socket.ioイベントハンドラー
@sio.event
async def connect(sid, environ):
    logger.info(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    logger.info(f"Client disconnected: {sid}")

@sio.event
async def join_room(sid, data):
    room = data.get('room')
    if room:
        sio.enter_room(sid, room)
        await sio.emit('user_joined', {'user': sid}, room=room)

@sio.event
async def leave_room(sid, data):
    room = data.get('room')
    if room:
        sio.leave_room(sid, room)
        await sio.emit('user_left', {'user': sid}, room=room)

# チャット関連のイベントハンドラー
@sio.event
async def send_message(sid, data):
    room = data.get('room')
    message = data.get('message')
    if room and message:
        await sio.emit('new_message', {
            'user': sid,
            'message': message,
            'timestamp': data.get('timestamp')
        }, room=room)

# マッチング関連のイベントハンドラー
@sio.event
async def request_match(sid, data):
    # マッチングリクエストの処理
    await sio.emit('match_request', data, room=data.get('target_room'))

@sio.event
async def accept_match(sid, data):
    # マッチング承認の処理
    await sio.emit('match_accepted', data, room=data.get('room')) 