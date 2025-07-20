from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.db.session import get_db
from app.services.notification_service import notification_service
from app.schemas.diary import NotificationResponse
from app.core.security import get_anonymous_token
import logging

logger = logging.getLogger(__name__)

router = APIRouter(tags=["notifications"])

@router.get("/notifications", response_model=List[NotificationResponse])
async def get_notifications(
    request: Request,
    limit: int = Query(50, ge=1, le=100, description="取得件数"),
    db: Session = Depends(get_db)
):
    """通知履歴を取得"""
    try:
        anonymous_token = get_anonymous_token(request)
        notifications = notification_service.get_notifications(db, anonymous_token, limit)
        return notifications
    except Exception as e:
        logger.error(f"通知取得エラー: {e}")
        raise HTTPException(status_code=500, detail="通知の取得に失敗しました")

@router.get("/notifications/unread-count")
async def get_unread_count(
    request: Request,
    db: Session = Depends(get_db)
):
    """未読通知数を取得"""
    try:
        anonymous_token = get_anonymous_token(request)
        count = notification_service.get_unread_count(db, anonymous_token)
        return {"unread_count": count}
    except Exception as e:
        logger.error(f"未読通知数取得エラー: {e}")
        raise HTTPException(status_code=500, detail="未読通知数の取得に失敗しました")

@router.put("/notifications/{notification_id}/read")
async def mark_notification_as_read(
    notification_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """通知を既読にする"""
    try:
        anonymous_token = get_anonymous_token(request)
        success = notification_service.mark_as_read(db, notification_id, anonymous_token)
        if not success:
            raise HTTPException(status_code=404, detail="通知が見つかりません")
        
        return {"message": "通知を既読にしました"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"通知既読エラー: {e}")
        raise HTTPException(status_code=500, detail="通知の既読処理に失敗しました")

@router.put("/notifications/read-all")
async def mark_all_notifications_as_read(
    request: Request,
    db: Session = Depends(get_db)
):
    """すべての通知を既読にする"""
    try:
        anonymous_token = get_anonymous_token(request)
        read_count = notification_service.mark_all_as_read(db, anonymous_token)
        return {
            "message": f"{read_count}件の通知を既読にしました",
            "read_count": read_count
        }
    except Exception as e:
        logger.error(f"全通知既読エラー: {e}")
        raise HTTPException(status_code=500, detail="全通知の既読処理に失敗しました")

@router.delete("/notifications/{notification_id}")
async def delete_notification(
    notification_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """通知を削除"""
    try:
        anonymous_token = get_anonymous_token(request)
        success = notification_service.delete_notification(db, notification_id, anonymous_token)
        if not success:
            raise HTTPException(status_code=404, detail="通知が見つかりません")
        
        return {"message": "通知を削除しました"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"通知削除エラー: {e}")
        raise HTTPException(status_code=500, detail="通知の削除に失敗しました")

@router.get("/notifications/type/{notification_type}", response_model=List[NotificationResponse])
async def get_notifications_by_type(
    notification_type: str,
    request: Request,
    limit: int = Query(20, ge=1, le=50, description="取得件数"),
    db: Session = Depends(get_db)
):
    """特定タイプの通知を取得"""
    try:
        anonymous_token = get_anonymous_token(request)
        notifications = notification_service.get_notifications_by_type(
            db, anonymous_token, notification_type, limit
        )
        return notifications
    except Exception as e:
        logger.error(f"タイプ別通知取得エラー: {e}")
        raise HTTPException(status_code=500, detail="タイプ別通知の取得に失敗しました") 