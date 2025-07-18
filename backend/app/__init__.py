from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import diary
from app.core.config import settings
from datetime import datetime

app = FastAPI(
    title="匿名日記サービス API",
    description="自然言語処理を使った匿名日記マッチングサービス",
    version="1.0.0"
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーターの登録
app.include_router(diary.router, prefix="/api/v1", tags=["diary"])

@app.get("/")
async def root():
    return {"message": "匿名日記サービス API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    """アプリケーションのヘルスチェック"""
    try:
        # データベース接続テスト
        from app.db.session import test_database_connection
        db_status = test_database_connection()
        
        return {
            "status": "healthy" if db_status else "unhealthy",
            "timestamp": datetime.utcnow().isoformat(),
            "version": settings.VERSION,
            "database": "connected" if db_status else "disconnected"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "timestamp": datetime.utcnow().isoformat(),
            "version": settings.VERSION,
            "error": str(e)
        } 