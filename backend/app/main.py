from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import diary
from app.core.config import settings
from app.core.socket import sio
import socketio
import logging

# ログ設定
logging.basicConfig(level=logging.INFO)
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