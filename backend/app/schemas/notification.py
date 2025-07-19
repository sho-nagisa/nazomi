from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime
from uuid import UUID

# ベース定義
class NotificationBase(BaseModel):
    type: Optional[str] = None
    anonymous_token: Optional[str] = None
    title: Optional[str] = None
    message: Optional[str] = None
    data: Optional[Any] = None
    is_read: Optional[bool] = False
    expires_at: Optional[datetime] = None

# 通知作成用スキーマ
class NotificationCreate(NotificationBase):
    pass

# DB取得用スキーマ
class Notification(NotificationBase):
    id: UUID
    created_at: datetime

    class Config:
        orm_mode = True