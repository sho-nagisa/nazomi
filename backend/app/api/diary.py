from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.db.crud import create_diary, get_diary, get_recent_diaries
from app.schemas.diary import DiaryCreate, DiaryResponse, KeywordResponse, CleanupResponse
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/diary", response_model=DiaryResponse)
async def create_diary_endpoint(
    diary: DiaryCreate,
    db: Session = Depends(get_db)
):
    """日記を投稿"""
    try:
        db_diary = await create_diary(db, diary)
        
        # レスポンス用に復号化
        response_diary = DiaryResponse(
            id=db_diary.id,
            content=diary.content,  # 元の内容を返す
            emotion_tag=db_diary.emotion_tag,
            keywords=db_diary.keywords,
            created_at=db_diary.created_at,
            expires_at=db_diary.expires_at
        )
        
        return response_diary
        
    except Exception as e:
        logger.error(f"Failed to create diary: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="日記の投稿に失敗しました"
        )

@router.get("/diary/{diary_id}", response_model=DiaryResponse)
async def get_diary_endpoint(
    diary_id: str,
    db: Session = Depends(get_db)
):
    """特定の日記を取得"""
    try:
        diary = get_diary(db, diary_id)
        if not diary:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="日記が見つかりません"
            )
        
        return DiaryResponse(
            id=diary.id,
            content=diary.content,
            emotion_tag=diary.emotion_tag,
            keywords=diary.keywords,
            created_at=diary.created_at,
            expires_at=diary.expires_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get diary: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="日記の取得に失敗しました"
        )

@router.get("/diary/{diary_id}/keywords", response_model=KeywordResponse)
async def get_diary_keywords_endpoint(
    diary_id: str,
    db: Session = Depends(get_db)
):
    """特定の日記のキーワードを取得"""
    try:
        diary = get_diary(db, diary_id)
        if not diary:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="日記が見つかりません"
            )
        
        keywords = diary.keywords or []
        keyword_list = [kw.get('text', '') for kw in keywords if isinstance(kw, dict)]
        
        return KeywordResponse(
            diary_id=diary_id,
            keywords=keyword_list
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get diary keywords: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="キーワードの取得に失敗しました"
        )

@router.delete("/diary/cleanup", response_model=CleanupResponse)
async def cleanup_expired_diaries_endpoint(
    db: Session = Depends(get_db)
):
    """期限切れの日記を削除"""
    try:
        # TODO: 実際のクリーンアップロジックを実装
        # 現在はダミーレスポンス
        deleted_count = 0  # 実際の削除処理をここに実装
        
        return CleanupResponse(
            deleted_count=deleted_count,
            message=f"{deleted_count}件の期限切れ日記を削除しました"
        )
        
    except Exception as e:
        logger.error(f"Failed to cleanup expired diaries: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="クリーンアップに失敗しました"
        )

@router.get("/diaries", response_model=List[DiaryResponse])
async def get_diaries_endpoint(
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """最近の日記一覧を取得"""
    try:
        diaries = get_recent_diaries(db, limit)
        
        return [
            DiaryResponse(
                id=diary.id,
                content=diary.content,
                emotion_tag=diary.emotion_tag,
                keywords=diary.keywords,
                created_at=diary.created_at,
                expires_at=diary.expires_at
            )
            for diary in diaries
        ]
        
    except Exception as e:
        logger.error(f"Failed to get diaries: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="日記一覧の取得に失敗しました"
        ) 