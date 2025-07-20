from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Request
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.db.session import get_db
from app.services.chat_service import chat_service
from app.schemas.diary import ChatRoomResponse, ChatMessageCreate, ChatMessageResponse
from app.core.security import get_anonymous_token
import json
import logging

logger = logging.getLogger(__name__)

router = APIRouter(tags=["chat"])

@router.get("/chat-rooms", response_model=List[ChatRoomResponse])
async def get_chat_rooms(
    request: Request,
    db: Session = Depends(get_db)
):
    """参加可能なチャットルーム一覧を取得"""
    try:
        anonymous_token = get_anonymous_token(request)
        logger.info(f"チャットルーム取得リクエスト: anonymous_token={anonymous_token}")
        
        rooms = chat_service.get_active_rooms(db, anonymous_token)
        logger.info(f"チャットルーム取得結果: {len(rooms)}件")
        
        return rooms
    except Exception as e:
        logger.error(f"チャットルーム取得エラー: {e}")
        raise HTTPException(status_code=500, detail="チャットルームの取得に失敗しました")

@router.get("/chat-rooms/{room_id}", response_model=ChatRoomResponse)
async def get_chat_room_info(
    room_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """チャットルーム情報を取得"""
    try:
        anonymous_token = get_anonymous_token(request)
        room = chat_service.get_room_info(db, room_id, anonymous_token)
        if not room:
            raise HTTPException(status_code=404, detail="チャットルームが見つかりません")
        return room
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"チャットルーム情報取得エラー: {e}")
        raise HTTPException(status_code=500, detail="チャットルーム情報の取得に失敗しました")

@router.get("/chat-rooms/{room_id}/messages", response_model=List[ChatMessageResponse])
async def get_chat_messages(
    room_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """チャットルームのメッセージを取得"""
    try:
        anonymous_token = get_anonymous_token(request)
        messages = chat_service.get_room_messages(db, room_id, anonymous_token)
        return messages
    except Exception as e:
        logger.error(f"チャットメッセージ取得エラー: {e}")
        raise HTTPException(status_code=500, detail="メッセージの取得に失敗しました")

@router.post("/chat-rooms/{room_id}/messages", response_model=ChatMessageResponse)
async def send_chat_message(
    room_id: str,
    message_data: ChatMessageCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """チャットメッセージを送信"""
    try:
        anonymous_token = get_anonymous_token(request)
        logger.info(f"メッセージ送信リクエスト: room_id={room_id}, cookie_token={anonymous_token}")
        
        # 匿名トークンをメッセージデータに追加
        message_data.anonymous_token = anonymous_token
        
        message = await chat_service.send_message(db, room_id, message_data)
        if not message:
            raise HTTPException(status_code=404, detail="チャットルームが見つからないか、アクセス権限がありません")
        
        return message
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"チャットメッセージ送信エラー: {e}")
        raise HTTPException(status_code=500, detail="メッセージの送信に失敗しました")

# WebSocket接続管理
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, room_id: str):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)
        logger.info(f"WebSocket接続: room={room_id}, total={len(self.active_connections[room_id])}")
    
    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.active_connections:
            self.active_connections[room_id].remove(websocket)
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]
        logger.info(f"WebSocket切断: room={room_id}")
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)
    
    async def broadcast_to_room(self, message: str, room_id: str, exclude_websocket: WebSocket = None):
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                if connection != exclude_websocket:
                    try:
                        await connection.send_text(message)
                    except Exception as e:
                        logger.error(f"WebSocket送信エラー: {e}")
                        # 接続が切れた場合は削除
                        self.active_connections[room_id].remove(connection)

manager = ConnectionManager()

@router.websocket("/ws/chat/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    """WebSocketエンドポイント（チャットリアルタイム通信）"""
    await manager.connect(websocket, room_id)
    
    try:
        while True:
            # メッセージを受信
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # メッセージをデータベースに保存
            try:
                db = next(get_db())
                chat_message = ChatMessageCreate(
                    content=message_data.get("content", ""),
                    anonymous_token=message_data.get("anonymous_token", "")
                )
                
                saved_message = await chat_service.send_message(db, room_id, chat_message)
                
                if saved_message:
                    # 他の参加者にブロードキャスト
                    broadcast_data = {
                        "type": "new_message",
                        "message": {
                            "id": saved_message.id,
                            "content": saved_message.content,
                            "anonymous_token": saved_message.anonymous_token,
                            "created_at": saved_message.created_at.isoformat()
                        }
                    }
                    await manager.broadcast_to_room(
                        json.dumps(broadcast_data, ensure_ascii=False),
                        room_id,
                        websocket
                    )
                    
                    # 送信者に確認メッセージを送信
                    confirm_data = {
                        "type": "message_sent",
                        "message_id": saved_message.id
                    }
                    await manager.send_personal_message(
                        json.dumps(confirm_data, ensure_ascii=False),
                        websocket
                    )
                
            except Exception as e:
                logger.error(f"WebSocketメッセージ処理エラー: {e}")
                error_data = {
                    "type": "error",
                    "message": "メッセージの送信に失敗しました"
                }
                await manager.send_personal_message(
                    json.dumps(error_data, ensure_ascii=False),
                    websocket
                )
            finally:
                db.close()
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)
    except Exception as e:
        logger.error(f"WebSocket接続エラー: {e}")
        manager.disconnect(websocket, room_id) 