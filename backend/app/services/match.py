from app.services.notifier import notify_user
from sqlalchemy.orm import Session
from app.db import crud

def match_and_create_room(db: Session, matched_users: list[str]):
    # 1. ルームをDBに作成
    room = crud.create_chat_room(db, participants=matched_users)

    # 2. 各ユーザーに通知を送信（ここが今回の追加）
    for token in matched_users:
        notify_user(db, user_token=token, event_type="room_created")

    return room