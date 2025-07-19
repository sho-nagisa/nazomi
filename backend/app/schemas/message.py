from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MessageCreate(BaseModel):
    match_id: int
    sender_id: str
    receiver_id: str
    content: str
    expires_at: datetime

class ChatMessageSchema(BaseModel):
    chat_room_id: str
    sender_token: str
    message: str
    timestamp: Optional[datetime] = None

    class Config:
        from_attributes = True
