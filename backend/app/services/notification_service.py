from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.db.models import Notification
from app.db.crud import get_notifications, mark_notification_as_read, cleanup_expired_notifications, delete_notification, get_notifications_by_type, get_unread_notifications_count, mark_all_notifications_as_read
from app.schemas.diary import NotificationResponse
from datetime import datetime, timedelta
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

class NotificationService:
    def __init__(self):
        self.notification_expiry_days = 7  # 通知の有効期限（7日）
    
    def get_notifications(self, db: Session, anonymous_token: str, limit: int = 50) -> List[NotificationResponse]:
        """通知履歴を取得"""
        try:
            # CRUD層の関数を使用
            notifications = get_notifications(db, anonymous_token, limit)
            return [NotificationResponse.model_validate(notification) for notification in notifications]
            
        except Exception as e:
            logger.error(f"通知取得エラー: {e}")
            return []
    
    def mark_as_read(self, db: Session, notification_id: str, anonymous_token: str) -> bool:
        """通知を既読にする"""
        try:
            # CRUD層の関数を使用
            return mark_notification_as_read(db, notification_id, anonymous_token)
            
        except Exception as e:
            logger.error(f"通知既読エラー: {e}")
            return False
    
    def mark_all_as_read(self, db: Session, anonymous_token: str) -> int:
        """すべての通知を既読にする"""
        try:
            # CRUD層の関数を使用
            read_count = mark_all_notifications_as_read(db, anonymous_token)
            logger.info(f"全通知既読: {read_count}件")
            return read_count
            
        except Exception as e:
            logger.error(f"全通知既読エラー: {e}")
            return 0
    
    def get_unread_count(self, db: Session, anonymous_token: str) -> int:
        """未読通知数を取得"""
        try:
            # CRUD層の関数を使用
            return get_unread_notifications_count(db, anonymous_token)
            
        except Exception as e:
            logger.error(f"未読通知数取得エラー: {e}")
            return 0
    
    def create_notification(self, db: Session, anonymous_token: str, notification_type: str, 
                          title: str, message: str, data: Optional[dict] = None) -> Optional[NotificationResponse]:
        """通知を作成"""
        try:
            notification = Notification(
                anonymous_token=anonymous_token,
                type=notification_type,
                title=title,
                message=message,
                data=data or {}
            )
            
            db.add(notification)
            db.commit()
            db.refresh(notification)
            
            logger.info(f"通知作成: {notification.id}, type: {notification_type}")
            return NotificationResponse.model_validate(notification)
            
        except Exception as e:
            logger.error(f"通知作成エラー: {e}")
            db.rollback()
            return None
    
    def cleanup_expired_notifications(self, db: Session) -> int:
        """期限切れの通知をクリーンアップ"""
        try:
            expired_notifications = db.query(Notification).filter(
                Notification.expires_at <= datetime.utcnow()
            ).all()
            
            cleanup_count = len(expired_notifications)
            for notification in expired_notifications:
                db.delete(notification)
            
            db.commit()
            logger.info(f"期限切れ通知クリーンアップ: {cleanup_count}件")
            return cleanup_count
            
        except Exception as e:
            logger.error(f"通知クリーンアップエラー: {e}")
            db.rollback()
            return 0
    
    def delete_notification(self, db: Session, notification_id: str, anonymous_token: str) -> bool:
        """通知を削除"""
        try:
            # CRUD層の関数を使用
            success = delete_notification(db, notification_id, anonymous_token)
            if success:
                logger.info(f"通知削除: {notification_id}")
            return success
            
        except Exception as e:
            logger.error(f"通知削除エラー: {e}")
            return False
    
    def get_notifications_by_type(self, db: Session, anonymous_token: str, 
                                notification_type: str, limit: int = 20) -> List[NotificationResponse]:
        """特定タイプの通知を取得"""
        try:
            # CRUD層の関数を使用
            notifications = get_notifications_by_type(db, anonymous_token, notification_type, limit)
            return [NotificationResponse.model_validate(notification) for notification in notifications]
            
        except Exception as e:
            logger.error(f"タイプ別通知取得エラー: {e}")
            return []

notification_service = NotificationService() 