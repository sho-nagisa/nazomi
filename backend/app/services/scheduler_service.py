import asyncio
import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.matching_service import matching_service
from app.services.chat_service import chat_service
from app.services.notification_service import notification_service
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

logger = logging.getLogger(__name__)

class SchedulerService:
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.is_running = False
    
    def start(self):
        """スケジューラーを開始"""
        if self.is_running:
            logger.warning("スケジューラーは既に実行中です")
            return
        
        try:
            # マッチング処理（朝9時、昼13時、夜20時）
            self.scheduler.add_job(
                self._run_matching_job,
                CronTrigger(hour="9,13,20", minute=0),
                id='matching_job',
                name='マッチング処理'
            )
            
            # ルーム終了警告チェック（毎時0分）
            self.scheduler.add_job(
                self._run_room_warning_job,
                CronTrigger(minute=0),
                id='room_warning_job',
                name='ルーム終了警告チェック'
            )
            
            # クリーンアップ処理（毎時30分）
            self.scheduler.add_job(
                self._run_cleanup_job,
                CronTrigger(minute=30),
                id='cleanup_job',
                name='クリーンアップ処理'
            )
            
            # 日記クリーンアップ（毎日午前2時）
            self.scheduler.add_job(
                self._run_diary_cleanup_job,
                CronTrigger(hour=2, minute=0),
                id='diary_cleanup_job',
                name='日記クリーンアップ'
            )
            
            self.scheduler.start()
            self.is_running = True
            logger.info("スケジューラーを開始しました")
            
        except Exception as e:
            logger.error(f"スケジューラー開始エラー: {e}")
    
    def stop(self):
        """スケジューラーを停止"""
        if not self.is_running:
            logger.warning("スケジューラーは実行されていません")
            return
        
        try:
            self.scheduler.shutdown()
            self.is_running = False
            logger.info("スケジューラーを停止しました")
            
        except Exception as e:
            logger.error(f"スケジューラー停止エラー: {e}")
    
    async def _run_matching_job(self):
        """マッチング処理を実行"""
        logger.info("マッチング処理を開始します")
        
        try:
            db = next(get_db())
            results = await matching_service.run_matching(db)
            
            logger.info(f"マッチング処理完了: {len(results)}件のルームを作成")
            
        except Exception as e:
            logger.error(f"マッチング処理エラー: {e}")
        finally:
            db.close()
    
    async def _run_room_warning_job(self):
        """ルーム終了警告チェックを実行"""
        logger.info("ルーム終了警告チェックを開始します")
        
        try:
            db = next(get_db())
            warning_rooms = chat_service.check_room_expiry_warning(db)
            
            if warning_rooms:
                logger.info(f"ルーム終了警告通知: {len(warning_rooms)}件")
            
        except Exception as e:
            logger.error(f"ルーム終了警告チェックエラー: {e}")
        finally:
            db.close()
    
    async def _run_cleanup_job(self):
        """クリーンアップ処理を実行"""
        logger.info("クリーンアップ処理を開始します")
        
        try:
            db = next(get_db())
            
            # 期限切れルームのクリーンアップ
            room_cleanup_count = chat_service.cleanup_expired_rooms(db)
            
            # 期限切れメッセージのクリーンアップ
            message_cleanup_count = chat_service.cleanup_expired_messages(db)
            
            # 期限切れ通知のクリーンアップ
            notification_cleanup_count = notification_service.cleanup_expired_notifications(db)
            
            total_cleanup = room_cleanup_count + message_cleanup_count + notification_cleanup_count
            
            if total_cleanup > 0:
                logger.info(f"クリーンアップ完了: ルーム{room_cleanup_count}件, メッセージ{message_cleanup_count}件, 通知{notification_cleanup_count}件")
            
        except Exception as e:
            logger.error(f"クリーンアップ処理エラー: {e}")
        finally:
            db.close()
    
    async def _run_diary_cleanup_job(self):
        """日記クリーンアップ処理を実行"""
        logger.info("日記クリーンアップ処理を開始します")
        
        try:
            db = next(get_db())
            
            # 期限切れの日記を削除
            from app.db.crud import cleanup_expired_diaries
            deleted_count = cleanup_expired_diaries(db)
            
            if deleted_count > 0:
                logger.info(f"日記クリーンアップ完了: {deleted_count}件削除")
            
        except Exception as e:
            logger.error(f"日記クリーンアップ処理エラー: {e}")
        finally:
            db.close()
    
    async def run_manual_matching(self) -> dict:
        """手動でマッチング処理を実行"""
        logger.info("手動マッチング処理を開始します")
        
        try:
            db = next(get_db())
            results = await matching_service.run_matching(db)
            
            return {
                "success": True,
                "message": f"マッチング処理完了: {len(results)}件のルームを作成",
                "results": [result.dict() for result in results]
            }
            
        except Exception as e:
            logger.error(f"手動マッチング処理エラー: {e}")
            return {
                "success": False,
                "message": f"マッチング処理エラー: {str(e)}",
                "results": []
            }
        finally:
            db.close()
    
    async def run_manual_cleanup(self) -> dict:
        """手動でクリーンアップ処理を実行"""
        logger.info("手動クリーンアップ処理を開始します")
        
        try:
            db = next(get_db())
            
            # 各クリーンアップ処理を実行
            room_cleanup_count = chat_service.cleanup_expired_rooms(db)
            message_cleanup_count = chat_service.cleanup_expired_messages(db)
            notification_cleanup_count = notification_service.cleanup_expired_notifications(db)
            
            from app.db.crud import cleanup_expired_diaries
            diary_cleanup_count = cleanup_expired_diaries(db)
            
            total_cleanup = room_cleanup_count + message_cleanup_count + notification_cleanup_count + diary_cleanup_count
            
            return {
                "success": True,
                "message": f"クリーンアップ処理完了: 合計{total_cleanup}件削除",
                "details": {
                    "rooms": room_cleanup_count,
                    "messages": message_cleanup_count,
                    "notifications": notification_cleanup_count,
                    "diaries": diary_cleanup_count
                }
            }
            
        except Exception as e:
            logger.error(f"手動クリーンアップ処理エラー: {e}")
            return {
                "success": False,
                "message": f"クリーンアップ処理エラー: {str(e)}",
                "details": {}
            }
        finally:
            db.close()
    
    def get_scheduler_status(self) -> dict:
        """スケジューラーの状態を取得"""
        try:
            jobs = []
            for job in self.scheduler.get_jobs():
                jobs.append({
                    "id": job.id,
                    "name": job.name,
                    "next_run_time": job.next_run_time.isoformat() if job.next_run_time else None,
                    "trigger": str(job.trigger)
                })
            
            return {
                "is_running": self.is_running,
                "job_count": len(jobs),
                "jobs": jobs
            }
            
        except Exception as e:
            logger.error(f"スケジューラー状態取得エラー: {e}")
            return {
                "is_running": self.is_running,
                "job_count": 0,
                "jobs": [],
                "error": str(e)
            }

# グローバルスケジューラーインスタンス
scheduler_service = SchedulerService() 