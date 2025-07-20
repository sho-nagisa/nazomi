from sqlalchemy.orm import Session
from app.db.session import engine, SessionLocal
from app.db.models import Base
import logging

logger = logging.getLogger(__name__)

def init_database():
    """データベースの初期化（テーブル作成）"""
    try:
        # テーブルを作成
        Base.metadata.create_all(bind=engine)
        logger.info("データベーステーブルを作成しました")
        
        # 初期データの挿入（必要に応じて）
        # create_initial_data()
        
        return True
    except Exception as e:
        logger.error(f"データベース初期化エラー: {e}")
        return False

def create_initial_data():
    """初期データの作成（必要に応じて）"""
    try:
        db = SessionLocal()
        
        # ここに初期データの挿入ロジックを追加
        # 例：管理者ユーザー、デフォルト設定など
        
        db.close()
        logger.info("初期データを作成しました")
        
    except Exception as e:
        logger.error(f"初期データ作成エラー: {e}")

def drop_all_tables():
    """すべてのテーブルを削除（開発用）"""
    try:
        Base.metadata.drop_all(bind=engine)
        logger.info("すべてのテーブルを削除しました")
        return True
    except Exception as e:
        logger.error(f"テーブル削除エラー: {e}")
        return False

def reset_database():
    """データベースをリセット（開発用）"""
    try:
        # すべてのテーブルを削除
        drop_all_tables()
        
        # テーブルを再作成
        init_database()
        
        logger.info("データベースをリセットしました")
        return True
    except Exception as e:
        logger.error(f"データベースリセットエラー: {e}")
        return False

if __name__ == "__main__":
    # スクリプトとして実行された場合の処理
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "init":
            init_database()
        elif command == "reset":
            reset_database()
        elif command == "drop":
            drop_all_tables()
        else:
            print("使用法: python init_db.py [init|reset|drop]")
    else:
        # デフォルトで初期化を実行
        init_database() 