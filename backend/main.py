import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from dotenv import load_dotenv

from app.api import chat, match

# .env 読み込み
load_dotenv("./.env")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")  # service_role を使う

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Supabase URL or Key not found in environment variables")

# FastAPI アプリ生成
app = FastAPI(
    title="Mental Diary Matching API",
    description="Supabase + FastAPI バックエンド",
    version="1.0.0"
)

# Supabase クライアントをアプリに登録
app.state.supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# CORS 設定（必要に応じて allow_origins を制限）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 本番環境ではドメイン指定
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーター追加
app.include_router(match.router, prefix="/api/match", tags=["Matching"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])

# テスト用ルート
@app.get("/")
async def root():
    return {"message": "Hello from FastAPI"}

@app.get("/healthcheck")
async def healthcheck():
    try:
        supabase: Client = app.state.supabase
        res = supabase.table("diary_posts").select("id").limit(1).execute()

        if res.status_code >= 400:
            raise HTTPException(status_code=500, detail="Supabase query failed")

        return {"status": "connected", "rows_checked": len(res.data)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase error: {e}")


