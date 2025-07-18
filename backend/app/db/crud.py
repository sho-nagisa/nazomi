from sqlalchemy.orm import Session
from app.db.models import Diary
from app.schemas.diary import DiaryCreate
from app.core.security import encryption_service
from app.services.nlp_service import nlp_service
import asyncio

async def create_diary(db: Session, diary: DiaryCreate) -> Diary:
    """日記を作成（暗号化して保存）"""
    # 内容を暗号化
    encrypted_content = encryption_service.encrypt_text(diary.content)
    
    # 日記オブジェクトを作成
    db_diary = Diary(
        content=encrypted_content,
        emotion_tag=diary.emotion_tag.value if diary.emotion_tag else None
    )
    
    # データベースに保存
    db.add(db_diary)
    db.commit()
    db.refresh(db_diary)
    
    # 非同期でNLP処理を実行
    asyncio.create_task(process_nlp_async(db, db_diary.id, diary.content))
    
    return db_diary

async def process_nlp_async(db: Session, diary_id: str, original_content: str):
    """非同期でNLP処理を実行"""
    try:
        # キーワード抽出
        keywords = await nlp_service.extract_keywords_async(original_content)
        
        # データベースを更新
        db_diary = db.query(Diary).filter(Diary.id == diary_id).first()
        if db_diary:
            db_diary.keywords = keywords
            db.commit()
            
    except Exception as e:
        print(f"NLP processing error: {e}")

def get_diary(db: Session, diary_id: str) -> Diary:
    """日記を取得（復号化して返す）"""
    diary = db.query(Diary).filter(Diary.id == diary_id).first()
    if diary:
        # 内容を復号化
        diary.content = encryption_service.decrypt_text(diary.content)
    return diary

def get_recent_diaries(db: Session, limit: int = 100) -> list[Diary]:
    """最近の日記を取得"""
    diaries = db.query(Diary).order_by(Diary.created_at.desc()).limit(limit).all()
    
    # 内容を復号化
    for diary in diaries:
        diary.content = encryption_service.decrypt_text(diary.content)
    
    return diaries 