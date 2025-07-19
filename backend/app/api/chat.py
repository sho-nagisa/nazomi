from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.crud import get_chat_room_participants
from app.services.notifier import notify_user
from app.schemas.chat import ChatMessageSchema
from app.services.supabase_client import save_message_to_supabase

router = APIRouter()

@router.post("/api/chat/send")
def send_message(payload: ChatMessageSchema, db: Session = Depends(get_db)):
    save_message_to_supabase(payload)
    participants = get_chat_room_participants(db, payload.chat_room_id)
    for token in participants:
        if token != payload.sender_token:
            notify_user(db, user_token=token, event_type="new_message")
    return {"status": "ok"}
