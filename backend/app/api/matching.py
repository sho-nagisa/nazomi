from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.db.session import get_db
from app.services.matching_service import matching_service
from app.schemas.diary import EmpathyWordResponse, MatchingResult
from app.core.security import get_anonymous_token
import logging

logger = logging.getLogger(__name__)

router = APIRouter(tags=["matching"])

@router.get("/empathy-words", response_model=List[Dict[str, Any]])
async def get_todays_empathy_words(db: Session = Depends(get_db)):
    """今日の共感ワード一覧を取得"""
    try:
        empathy_words = matching_service.get_todays_empathy_words(db)
        return empathy_words
    except Exception as e:
        logger.error(f"共感ワード取得エラー: {e}")
        raise HTTPException(status_code=500, detail="共感ワードの取得に失敗しました")

@router.post("/matching/run", response_model=Dict[str, Any])
async def run_matching_manual(db: Session = Depends(get_db)):
    """手動でマッチング処理を実行（管理者用）"""
    try:
        from app.services.scheduler_service import scheduler_service
        result = await scheduler_service.run_manual_matching()
        return {"message": "マッチング処理を開始しました", "result": result}
    except Exception as e:
        logger.error(f"手動マッチング実行エラー: {e}")
        raise HTTPException(status_code=500, detail="マッチング処理の実行に失敗しました")

@router.get("/matching/status", response_model=Dict[str, Any])
async def get_matching_status(db: Session = Depends(get_db)):
    """マッチング処理の状態を取得（管理者用）"""
    try:
        from app.services.scheduler_service import scheduler_service
        status = scheduler_service.get_scheduler_status()
        return {"status": status}
    except Exception as e:
        logger.error(f"マッチング状態取得エラー: {e}")
        raise HTTPException(status_code=500, detail="マッチング状態の取得に失敗しました") 