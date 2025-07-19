from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import socketio
import logging

# 1. .env を一番最初に読み込む（Supabase 初期化前に必要）
load_dotenv()

# 2. ログ設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 3. 設定とSocket.IO
from app.core.config import settings
from app.core.socket import sio

# 4. FastAPI アプリ本体の作成
app = FastAPI(
    title=settings.APP_NAME,
    description="匿名日記サービス API",
    version=settings.VERSION
)

# 5. CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 6. APIルーター登録（.env読み込み後にモジュール読み込み）
from app.api import diary, chat, match

app.include_router(diary.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(match.router, prefix="/api")

# 7. テスト用エンドポイント
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

# 8. Socket.IO アプリとして FastAPI を統合
socket_app = socketio.ASGIApp(sio, app)
