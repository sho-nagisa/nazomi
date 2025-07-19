from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ChatMessageBase(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000, description="メッセージ内容")
    message_type: str = Field(default="text", description="メッセージタイプ")

class ChatMessageCreate(ChatMessageBase):
    pass

class ChatMessageResponse(ChatMessageBase):
    id: str
    chat_id: str
    sender_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class ChatRoomBase(BaseModel):
    title: Optional[str] = Field(None, max_length=100, description="チャットルーム名")

class ChatRoomCreate(ChatRoomBase):
    participant_ids: list[str] = Field(..., min_items=2, description="参加者ID")

class ChatRoomResponse(ChatRoomBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True 