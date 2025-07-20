import os
from typing import List, Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # アプリケーション設定
    APP_NAME: str = "匿名日記サービス"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # サーバー設定
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # CORS設定
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173", "http://127.0.0.1:8000"]
    
    # Supabase設定
    SUPABASE_URL: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None
    
    # データベース設定（直接URL方式）
    DATABASE_URL: Optional[str] = None
    
    # 暗号化設定
    ENCRYPTION_KEY: Optional[str] = None
    
    # NLP設定
    SPACY_MODEL: str = "ja_core_news_sm"
    
    # JWT設定
    JWT_SECRET: Optional[str] = None
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # マッチング設定
    MATCHING_SIMILARITY_THRESHOLD: float = 0.7
    MATCHING_MAX_PARTICIPANTS: int = 5
    MATCHING_TIME_WINDOW_HOURS: int = 2
    
    # チャット設定
    CHAT_MESSAGE_EXPIRY_HOURS: int = 48
    CHAT_ROOM_EXPIRY_HOURS: int = 24
    
    # 通知設定
    NOTIFICATION_EXPIRY_DAYS: int = 7
    
    # スケジューラー設定
    SCHEDULER_ENABLED: bool = True
    MATCHING_SCHEDULE_HOURS: List[int] = [9, 13, 20]  # 朝9時、昼13時、夜20時
    
    # セキュリティ設定
    ANONYMOUS_TOKEN_LENGTH: int = 32
    CONTENT_FILTERING_ENABLED: bool = True
    
    # ログ設定
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings() 