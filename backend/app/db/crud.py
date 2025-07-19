from datetime import datetime, timedelta
import asyncio

from sqlalchemy.orm import Session

from app.core.security import encryption_service
from app.db.models import ChatRoom, Diary, MatchTable, Message
from app.schemas.chat_room import ChatRoomCreate
from app.schemas.diary import DiaryCreate
from app.schemas.match import MatchCreate
from app.schemas.message import MessageCreate
from app.services.nlp_service import nlp_service


async def create_diary(db: Session, diary: DiaryCreate) -> Diary:
    """日記を作成（暗号化して保存）"""
    # 内容を暗号化
    encrypted_content = encryption_service.encrypt_text(diary.content)
    
    # 日記オブジェクトを作成
    db_diary = Diary(
        content=encrypted_content,
        emotion_tag=diary.emotion_tag.value if diary.emotion_tag else None
    )
    
    # データベースに保存
    db.add(db_diary)
    db.commit()
    db.refresh(db_diary)
    
    # 非同期でNLP処理を実行
    asyncio.create_task(process_nlp_async(db, db_diary.id, diary.content))
    
    return db_diary

async def process_nlp_async(db: Session, diary_id: str, original_content: str):
    """非同期でNLP処理を実行"""
    try:
        # キーワード抽出
        keywords = await nlp_service.extract_keywords_async(original_content)
        
        # データベースを更新
        db_diary = db.query(Diary).filter(Diary.id == diary_id).first()
        if db_diary:
            db_diary.keywords = keywords
            db.commit()
            
    except Exception as e:
        print(f"NLP processing error: {e}")

def get_diary(db: Session, diary_id: str) -> Diary:
    """日記を取得（復号化して返す）"""
    diary = db.query(Diary).filter(Diary.id == diary_id).first()
    if diary:
        # 内容を復号化
        diary.content = encryption_service.decrypt_text(diary.content)
    return diary

def get_recent_diaries(db: Session, limit: int = 100) -> list[Diary]:
    """最近の日記を取得"""
    diaries = db.query(Diary).order_by(Diary.created_at.desc()).limit(limit).all()
    
    # 内容を復号化
    for diary in diaries:
        diary.content = encryption_service.decrypt_text(diary.content)
    
    return diaries 
async def create_diary(db: Session, diary: DiaryCreate) -> Diary:
    encrypted_content = encryption_service.encrypt_text(diary.content)
    db_diary = Diary(
        content=encrypted_content,
        emotion_tag=diary.emotion_tag.value if diary.emotion_tag else None
    )
    db.add(db_diary)
    db.commit()
    db.refresh(db_diary)
    asyncio.create_task(process_nlp_async(db, db_diary.id, diary.content))
    return db_diary

async def process_nlp_async(db: Session, diary_id: str, original_content: str):
    try:
        keywords = await nlp_service.extract_keywords_async(original_content)
        db_diary = db.query(Diary).filter(Diary.id == diary_id).first()
        if db_diary:
            db_diary.keywords = keywords
            db.commit()
    except Exception as e:
        print(f"NLP processing error: {e}")

def get_diary(db: Session, diary_id: str) -> Diary:
    diary = db.query(Diary).filter(Diary.id == diary_id).first()
    if diary:
        diary.content = encryption_service.decrypt_text(diary.content)
    return diary

def get_recent_diaries(db: Session, limit: int = 100) -> list[Diary]:
    diaries = db.query(Diary).order_by(Diary.created_at.desc()).limit(limit).all()
    for diary in diaries:
        diary.content = encryption_service.decrypt_text(diary.content)
    return diaries

# -------------------------
# 💬 Chat 関連
# -------------------------

def create_chat_room(db: Session, room: ChatRoomCreate) -> ChatRoom:
    db_room = ChatRoom(
        participants=room.participants,
        empathy_words=room.empathy_words,
        expires_at=room.expires_at
    )
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    return db_room

def get_active_chat_rooms(db: Session) -> list[ChatRoom]:
    now = datetime.utcnow()
    return db.query(ChatRoom).filter(ChatRoom.expires_at > now).all()

# -------------------------
# 🤝 Match 関連
# -------------------------

def create_match(db: Session, match: MatchCreate) -> MatchTable:
    db_match = MatchTable(
        user_id_1=match.user_id_1,
        user_id_2=match.user_id_2,
    )
    db.add(db_match)
    db.commit()
    db.refresh(db_match)
    return db_match

def create_message(db: Session, message: MessageCreate) -> Message:
    db_message = Message(
        match_id=message.match_id,
        sender_id=message.sender_id,
        receive_id=message.receive_id,
        content=message.content,
        send_at=message.send_at,
        expires_at=message.expires_at
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

def get_messages_by_match(db: Session, match_id: str) -> list[Message]:
    return db.query(Message).filter(Message.match_id == match_id).order_by(Message.send_at.asc()).all()

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