from sqlalchemy.orm import Session
from uuid import uuid4
from datetime import datetime

from app.schemas.notification import NotificationCreate
from app.db.models import Notification

# 通知の作成
def create_notification(db: Session, notification: NotificationCreate) -> Notification:
    db_notification = Notification(
        id=uuid4(),
        type=notification.type,
        anonymous_token=notification.anonymous_token,
        title=notification.title,
        message=notification.message,
        data=notification.data,
        is_read=notification.is_read,
        created_at=datetime.utcnow(),
        expires_at=notification.expires_at,
    )
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification

# 通知の取得（例：全件）
def get_notifications(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Notification).offset(skip).limit(limit).all()
