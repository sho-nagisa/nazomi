from sqlalchemy.orm import Session
from . import models
from datetime import datetime, timedelta


def create_notification(db: Session, user_token: str, message: str):
    notif = models.Notification(user_token=user_token, message=message)
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif

def get_notifications(db: Session, user_token: str):
    return db.query(models.Notification).filter(models.Notification.user_token == user_token).all()

def get_chat_room_participants(db: Session, room_id: int) -> list[str]:
    room = db.query(models.ChatRoom).filter(models.ChatRoom.id == room_id).first()
    if room and room.participants:
        return room.participants  # JSONBとしてリスト扱いされる
    return []

def get_chat_room_participants(db: Session, room_id: int) -> list[str]:
    room = db.query(models.ChatRoom).filter(models.ChatRoom.id == room_id).first()
    if room and room.participants:
        return room.participants  # JSONB型でlistのはず
    return []

def get_rooms_expiring_at(db: Session, expires_at_time: datetime):
    return (
        db.query(models.ChatRoom)
        .filter(models.ChatRoom.expires_at.between(expires_at_time - timedelta(minutes=1), expires_at_time + timedelta(minutes=1)))
        .all()
    )
