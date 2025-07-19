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
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    # Supabase設定
    SUPABASE_URL: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None
    
    # データベース設定（直接URL方式）
    DATABASE_URL: Optional[str] = None
    
    # 暗号化設定
    ENCRYPTION_KEY: Optional[str] = None
    
    # NLP設定
    SPACY_MODEL: str = "ja_core_news_sm"
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings() 