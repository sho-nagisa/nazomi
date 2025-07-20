import pytest
import asyncio
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from app.main import app
from app.db.models import Base
from app.db.session import get_db
from app.core.config import settings
import logging

# テスト用ログ設定
logging.basicConfig(level=logging.DEBUG)

# テスト用データベースURL
TEST_DATABASE_URL = "sqlite:///./test.db"

# テスト用エンジン
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# テスト用セッションファクトリ
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    """テスト用データベースセッション"""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

# 依存性をオーバーライド
app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session")
def event_loop():
    """イベントループの作成"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session")
def client():
    """テストクライアント"""
    with TestClient(app) as c:
        yield c

@pytest.fixture(scope="function")
def db_session():
    """テスト用データベースセッション"""
    # テーブルを作成
    Base.metadata.create_all(bind=test_engine)
    
    # セッションを作成
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        # テーブルを削除
        Base.metadata.drop_all(bind=test_engine)

@pytest.fixture(scope="function")
def shared_db_session():
    """APIとテストで共有するデータベースセッション"""
    # テーブルを作成
    Base.metadata.create_all(bind=test_engine)
    
    # セッションを作成
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        # テーブルを削除
        Base.metadata.drop_all(bind=test_engine)

@pytest.fixture
def sample_diary_data():
    """サンプル日記データ"""
    return {
        "content": "今日はとても良い天気でした。公園で散歩をして、新しい友達と出会いました。",
        "emotion_tag": "happy"
    }

@pytest.fixture
def sample_chat_message_data():
    """サンプルチャットメッセージデータ"""
    return {
        "content": "こんにちは！共感できる内容ですね。",
        "anonymous_token": "test_token_123"
    }

@pytest.fixture
def sample_notification_data():
    """サンプル通知データ"""
    return {
        "type": "matching_success",
        "title": "共感ルームが開かれました",
        "message": "あなたの日記と共感できる仲間が見つかりました。",
        "data": {"room_id": "test_room_123"}
    } 