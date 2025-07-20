from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, List, Dict, Any
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
    emotion_tag: Optional[str] = Field(None, description="感情タグ")
    anonymous_token: Optional[str] = Field(None, description="匿名トークン")
    
    @field_validator('content')
    @classmethod
    def validate_content(cls, v):
        if not v.strip():
            raise ValueError('内容は空にできません')
        return v.strip()
    
    @field_validator('emotion_tag')
    @classmethod
    def validate_emotion_tag(cls, v):
        if v is not None:
            valid_emotions = ['happy', 'sad', 'angry', 'excited', 'calm', 'anxious', 'grateful', 'lonely']
            if v not in valid_emotions:
                raise ValueError(f'無効な感情タグです。有効な値: {", ".join(valid_emotions)}')
        return v

class DiaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    content: str
    emotion_tag: Optional[str]
    keywords: Optional[List[dict]]
    created_at: datetime
    expires_at: datetime
    is_matched: bool
    anonymous_token: Optional[str]
    
    @field_validator('id', mode='before')
    @classmethod
    def validate_id(cls, v):
        # UUID型を文字列に変換
        return str(v)

class KeywordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    diary_id: str
    keywords: List[str] = Field(..., description="抽出されたキーワード")

class CleanupResponse(BaseModel):
    deleted_count: int = Field(..., description="削除された日記の数")
    message: str = Field(..., description="クリーンアップ結果のメッセージ")

# マッチング機能のスキーマ
class EmpathyWordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    word: str
    frequency: int
    importance_score: float

class ChatRoomCreate(BaseModel):
    empathy_words: List[Dict[str, Any]]
    participants: List[str]
    max_participants: int = 5

class ChatRoomResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    empathy_words: List[Dict[str, Any]]
    participants: List[str]
    created_at: datetime
    expires_at: datetime
    is_active: bool
    max_participants: int
    
    @field_validator('id', mode='before')
    @classmethod
    def validate_id(cls, v):
        # UUID型を文字列に変換
        return str(v)

class ChatMessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=500, description="メッセージ内容")
    anonymous_token: Optional[str] = Field(None, description="匿名トークン")
    
    @field_validator('content')
    @classmethod
    def validate_content(cls, v):
        if not v.strip():
            raise ValueError('内容は空にできません')
        return v.strip()

class ChatMessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    room_id: str
    anonymous_token: str
    content: str
    created_at: datetime
    
    @field_validator('id', 'room_id', mode='before')
    @classmethod
    def validate_id(cls, v):
        # UUID型を文字列に変換
        return str(v)

class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    type: str
    title: str
    message: str
    data: Optional[Dict[str, Any]]
    is_read: bool
    created_at: datetime
    anonymous_token: str  # 追加

class MatchingResult(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    room_id: str
    empathy_words: List[Dict[str, Any]]
    participants_count: int
    created_at: datetime 