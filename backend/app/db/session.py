from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session, declarative_base
from app.core.config import settings
import os
import logging

logger = logging.getLogger(__name__)

# --- データベースURLの構築 ---

def get_database_url() -> str:
    """環境変数からデータベースURLを取得"""
    try:
        # 明示的に DATABASE_URL が設定されていればそれを優先
        if settings.DATABASE_URL:
            logger.info("Using direct DATABASE_URL from environment")
            return settings.DATABASE_URL

        # SQLite fallback（テスト用途など）
        fallback = os.getenv("DATABASE_URL", "sqlite:///./test.db")
        if fallback.startswith("sqlite"):
            logger.warning("Falling back to SQLite database for local use")
            return fallback

        # Supabase URL から構築
        host_part = settings.SUPABASE_URL.replace('https://', '').replace('http://', '')
        db_host = f"db.{host_part}"

        database_url = (
            f"postgresql://postgres:"
            f"{settings.SUPABASE_SERVICE_ROLE_KEY}@"
            f"{db_host}:5432/postgres"
        )

        logger.info(f"Database connection configured for host: {db_host}")
        return database_url

    except Exception as e:
        logger.error(f"Failed to build database URL: {e}")
        raise

# --- エンジン作成 ---

DATABASE_URL = get_database_url()

connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    echo=settings.DEBUG,
    pool_size=5 if "sqlite" not in DATABASE_URL else None,
    max_overflow=10 if "sqlite" not in DATABASE_URL else None,
    connect_args=connect_args
)

# --- セッション・ベース定義 ---

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- DB セッション取得用の依存関数 ---

def get_db():
    """データベースセッションの取得"""
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- 接続テスト ---

def test_database_connection():
    """データベース接続をテスト"""
    try:
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        logger.info("Database connection test successful")
        return True
    except Exception as e:
        logger.error(f"Database connection test failed: {e}")
        return False
