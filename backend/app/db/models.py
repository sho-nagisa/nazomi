from sqlalchemy import Column, String, Text, DateTime, JSON
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