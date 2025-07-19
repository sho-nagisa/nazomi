from pydantic import BaseModel
from datetime import datetime

class MessageCreate(BaseModel):
    match_id: int
    sender_id: str
    receiver_id: str
    content: str
    expires_at: datetime
