# app/schemas/chat_room.py

from pydantic import BaseModel
from typing import List
from datetime import datetime

class ChatRoomCreate(BaseModel):
    participants: List[str]
    empathy_words: List[str]
    expires_at: datetime
