from fastapi import FastAPI, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api import diary, matching, chat, notifications
from app.core.config import settings
from app.core.socket import sio
from app.core.security import get_anonymous_token
from app.services.scheduler_service import scheduler_service
from app.db.session import test_database_connection
from app.db.init_db import init_database
import socketio
import logging

# ログ設定
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format=settings.LOG_FORMAT
)
logger = logging.getLogger(__name__)

# FastAPIアプリケーション
app = FastAPI(
    title=settings.APP_NAME,
    description="匿名日記サービス API",
    version=settings.VERSION
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Socket.ioアプリケーション
socket_app = socketio.ASGIApp(sio, app)

# ルーターの登録
app.include_router(diary.router, prefix="/api")
app.include_router(matching.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")

# 復号化APIを追加
from app.api import decrypt
app.include_router(decrypt.router, prefix="/api")

@app.middleware("http")
async def set_anonymous_token_cookie(request: Request, call_next):
    """匿名トークンのCookieを設定するミドルウェア"""
    response = await call_next(request)
    
    # 新しい匿名トークンが生成された場合、Cookieに設定
    if hasattr(request.state, 'new_anonymous_token'):
        response.set_cookie(
            key="anonymous_token",
            value=request.state.new_anonymous_token,
            max_age=30 * 24 * 60 * 60,  # 30日
            httponly=True,
            secure=False,  # HTTPS環境ではTrueに設定
            samesite="lax"
        )
    
    return response

@app.on_event("startup")
async def startup_event():
    """アプリケーション起動時の処理"""
    logger.info("アプリケーションを起動しています...")
    
    # データベース接続テスト
    if not test_database_connection():
        logger.error("データベース接続に失敗しました")
        return
    
    # データベース初期化
    if not init_database():
        logger.error("データベース初期化に失敗しました")
        return
    
    # スケジューラーを開始
    if settings.SCHEDULER_ENABLED:
        try:
            scheduler_service.start()
            logger.info("スケジューラーを開始しました")
        except Exception as e:
            logger.error(f"スケジューラー開始エラー: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    """アプリケーション終了時の処理"""
    logger.info("アプリケーションを終了しています...")
    
    # スケジューラーを停止
    if settings.SCHEDULER_ENABLED:
        try:
            scheduler_service.stop()
            logger.info("スケジューラーを停止しました")
        except Exception as e:
            logger.error(f"スケジューラー停止エラー: {e}")

@app.get("/")
async def root():
    return {
        "message": settings.APP_NAME,
        "version": settings.VERSION,
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/api/status")
async def get_status():
    """システム状態を取得"""
    try:
        scheduler_status = scheduler_service.get_scheduler_status()
        db_status = test_database_connection()
        
        return {
            "app_name": settings.APP_NAME,
            "version": settings.VERSION,
            "database": "connected" if db_status else "disconnected",
            "scheduler": scheduler_status,
            "features": {
                "matching": True,
                "chat": True,
                "notifications": True,
                "encryption": True,
                "nlp": True
            }
        }
    except Exception as e:
        logger.error(f"ステータス取得エラー: {e}")
        return {
            "app_name": settings.APP_NAME,
            "version": settings.VERSION,
            "error": str(e)
        } 