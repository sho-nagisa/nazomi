from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum

class EmotionTag(str, Enum):
    HAPPY = "happy"
    SAD = "sad"
    ANGRY = "angry"
    EXCITED = "excited"
    CALM = "calm"
    ANXIOUS = "anxious"
    GRATEFUL = "grateful"
    LONELY = "lonely"

class DiaryCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000, description="日記の内容")
    emotion_tag: Optional[EmotionTag] = Field(None, description="感情タグ")
    
    @validator('content')
    def validate_content(cls, v):
        if not v.strip():
            raise ValueError('内容は空にできません')
        return v.strip()

class DiaryResponse(BaseModel):
    id: str
    content: str
    emotion_tag: Optional[str]
    keywords: Optional[List[dict]]
    created_at: datetime
    expires_at: datetime
    
    class Config:
        from_attributes = True

class KeywordResponse(BaseModel):
    diary_id: str
    keywords: List[str] = Field(..., description="抽出されたキーワード")
    
    class Config:
        from_attributes = True

class CleanupResponse(BaseModel):
    deleted_count: int = Field(..., description="削除された日記の数")
    message: str = Field(..., description="クリーンアップ結果のメッセージ") 