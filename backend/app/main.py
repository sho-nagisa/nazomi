from fastapi import FastAPI
from app.services.notifier import notify_rooms_expiring_soon

app = FastAPI()

from app.api import notification

app.include_router(notification.router)

from apscheduler.schedulers.background import BackgroundScheduler
from app.services.notifier import notify_rooms_expiring_soon
from app.db.session import SessionLocal

def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        func=lambda: notify_rooms_expiring_soon(SessionLocal()),
        trigger="interval",
        minutes=10  # 10分ごとにチェック（または好みで）
    )
    scheduler.start()

start_scheduler()
