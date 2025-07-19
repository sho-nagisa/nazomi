from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.schemas.notification import NotificationCreate, Notification
from app.services import notification as notification_service

router = APIRouter()

# DBセッションを取得する依存関数
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 通知作成
@router.post("/notifications/", response_model=Notification)
def create_notification(notification: NotificationCreate, db: Session = Depends(get_db)):
    return notification_service.create_notification(db, notification)

# 通知取得（すべて）
@router.get("/notifications/", response_model=list[Notification])
def get_notifications(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return notification_service.get_notifications(db, skip=skip, limit=limit)
