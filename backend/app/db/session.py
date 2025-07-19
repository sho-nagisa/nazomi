from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Supabase PostgreSQL接続URLの取得
def get_database_url():
    """環境変数からデータベースURLを取得"""
    try:
        # 直接DATABASE_URLが設定されている場合はそれを使用
        if settings.DATABASE_URL:
            logger.info("Using direct DATABASE_URL from environment")
            return settings.DATABASE_URL
        
        # 従来の方法でURLを構築
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

# データベースエンジンの作成
engine = create_engine(
    get_database_url(),
    pool_pre_ping=True,
    echo=settings.DEBUG,
    pool_size=5,
    max_overflow=10
)

# セッションファクトリの作成
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """データベースセッションの取得"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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