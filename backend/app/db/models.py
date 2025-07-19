from sqlalchemy import Column, String, Text, DateTime, JSON, Integer, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime, timedelta
import uuid

Base = declarative_base()

def generate_uuid():
    return str(uuid.uuid4())

class Diary(Base):
    __tablename__ = "diaries"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    content = Column(Text, nullable=False)  # 暗号化された内容
    emotion_tag = Column(String, nullable=True)
    keywords = Column(JSON, nullable=True)  # 抽出されたキーワード
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(hours=24)) 

class ParsedKeyword(Base):
    __tablename__ = "parsed_keywords"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    diary_id = Column(String, ForeignKey("diaries.id"), nullable=False)
    user_id = Column(String, nullable=False)  # SupabaseユーザーID
    word = Column(String, nullable=False)
    frequency = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

class MatchTable(Base):
    __tablename__ = "match_table"

    id = Column(Integer, primary_key=True, autoincrement=True)
    room_id = Column(String, nullable=False)
    user_id = Column(String, nullable=False)
    matched_at = Column(DateTime, default=datetime.utcnow)

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    match_id = Column(Integer, ForeignKey("match_table.id"), nullable=False)
    sender_id = Column(String, nullable=False)
    receiver_id = Column(String, nullable=True)  # ← 読みやすさ向上のため修正（任意）
    content = Column(Text, nullable=False)
    send_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(hours=48))

class ChatRoom(Base):
    __tablename__ = "chat_rooms"

    id = Column(Integer, primary_key=True, autoincrement=True)
    participants = Column(JSON, nullable=False)  # 例: ["user1", "user2", ...]
    empathy_words = Column(JSON, nullable=True)
    expires_at = Column(DateTime, nullable=False)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    type = Column(String)
    anonymous_token = Column(String)
    title = Column(String)
    message = Column(Text)
    data = Column(JSON)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)