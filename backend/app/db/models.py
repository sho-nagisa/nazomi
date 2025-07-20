from sqlalchemy import Column, String, Text, DateTime, JSON, Boolean, Integer, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
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
    is_matched = Column(Boolean, default=False)  # マッチング済みフラグ
    anonymous_token = Column(String, nullable=True)  # 匿名トークン

class ChatRoom(Base):
    __tablename__ = "chat_rooms"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    empathy_words = Column(JSON, nullable=False)  # 共通の共感ワード
    participants = Column(JSON, nullable=False)  # 参加ユーザーの匿名トークン
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(hours=24))
    is_active = Column(Boolean, default=True)  # アクティブフラグ
    max_participants = Column(Integer, default=5)  # 最大参加者数

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    room_id = Column(String, ForeignKey("chat_rooms.id"), nullable=False)
    anonymous_token = Column(String, nullable=False)  # 送信者の匿名トークン
    content = Column(Text, nullable=False)  # 暗号化されたメッセージ内容
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(hours=48))

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    anonymous_token = Column(String, nullable=False)  # 通知対象の匿名トークン
    type = Column(String, nullable=False)  # 通知タイプ
    title = Column(String, nullable=False)  # 通知タイトル
    message = Column(Text, nullable=False)  # 通知メッセージ
    data = Column(JSON, nullable=True)  # 追加データ
    is_read = Column(Boolean, default=False)  # 既読フラグ
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(days=7))

# リレーションシップの設定
ChatRoom.messages = relationship("ChatMessage", backref="room", cascade="all, delete-orphan") 