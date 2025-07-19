from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from datetime import datetime, timedelta
from app.schemas.message import ChatMessageSchema
from fastapi import Depends
from app.db.session import get_db
from supabase import create_client
import os
from dotenv import load_dotenv
import json
import asyncio
from sqlalchemy.orm import Session

router = APIRouter()

load_dotenv(".env")
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

# 接続中のWebSocketクライアント管理
active_connections = {}

# WebSocketルーム接続
@router.websocket("/ws/chat/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    await websocket.accept()
    if room_id not in active_connections:
        active_connections[room_id] = []
    active_connections[room_id].append(websocket)

    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            content = message_data["content"]
            sender_id = message_data["sender_id"]

            # Supabaseに保存
            expires_at = (datetime.utcnow() + timedelta(hours=48)).isoformat()
            supabase.table("message").insert({
                "matchid": int(room_id),
                "senderId": sender_id,
                "recieveId": None,  # グループチャットでは不要 or 空欄
                "content": content,
                "send_at": datetime.utcnow().isoformat(),
                "expires_at": expires_at
            }).execute()

            # 他のクライアントにブロードキャスト
            for connection in active_connections[room_id]:
                if connection != websocket:
                    await connection.send_text(json.dumps({
                        "room_id": room_id,
                        "sender_id": sender_id,
                        "content": content,
                        "send_at": datetime.utcnow().isoformat()
                    }))
    except WebSocketDisconnect:
        active_connections[room_id].remove(websocket)

# チャットルームの自動クローズ処理（24時間後）
@router.post("/api/chat-rooms/cleanup")
async def cleanup_expired_chat_rooms():
    try:
        now = datetime.utcnow().isoformat()

        # 削除前に件数確認（任意）
        response = supabase.table("chat_rooms").select("*").lt("expires_at", now).execute()
        deleted_count = len(response.data)

        # 一括削除
        supabase.table("chat_rooms").delete().lt("expires_at", now).execute()

        return {"deleted": deleted_count}
    except Exception as e:
        return {"error": str(e)}


# 48時間経過したメッセージ削除処理
@router.post("/api/messages/cleanup")
async def cleanup_old_messages():
    try:
        now = datetime.utcnow().isoformat()
        response = supabase.table("message").select("*").execute()
        expired = [m for m in response.data if m.get("expires_at") and m["expires_at"] < now]

        for msg in expired:
            supabase.table("message").delete().eq("id", msg["id"]).execute()

        return {"deleted": len(expired)}
    except Exception as e:
        return {"error": str(e)}

@router.post("/api/chat/send")
def send_message(payload: ChatMessageSchema, db: Session = Depends(get_db)):
    save_message_to_supabase(payload)
    participants = get_chat_room_participants(db, payload.chat_room_id)
    for token in participants:
        if token != payload.sender_token:
            notify_user(db, user_token=token, event_type="new_message")
    return {"status": "ok"}