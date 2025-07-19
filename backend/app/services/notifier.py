from sqlalchemy.orm import Session
from app.db import crud

def notify_user(db: Session, user_token: str, event_type: str):
    message_map = {
        "room_created": "共感ルームが開かれました",
        "new_message": "新しいメッセージがあります",
        "room_ending": "ルーム終了まで1時間です",
    }
    message = message_map.get(event_type)
    if message:
        crud.create_notification(db, user_token=user_token, message=message)

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.db import crud

def notify_rooms_expiring_soon(db: Session):
    now = datetime.utcnow()
    threshold = now + timedelta(hours=1)

    # 1時間後に終了するチャットルームを抽出
    rooms = crud.get_rooms_expiring_at(db, threshold)

    for room in rooms:
        for token in room.participants:
            crud.create_notification(db, user_token=token, message="ルーム終了まで1時間です")
            
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.db import crud

def notify_rooms_expiring_soon(db: Session):
    now = datetime.utcnow()
    threshold = now + timedelta(hours=1)

    # 1時間後に終了するルームを取得
    rooms = crud.get_rooms_expiring_at(db, threshold)

    for room in rooms:
        for token in room.participants:
            crud.create_notification(db, user_token=token, message="ルーム終了まで1時間です")

