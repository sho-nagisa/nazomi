from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.db.models import Diary, ChatRoom, ChatMessage, Notification
from app.schemas.diary import DiaryCreate, ChatRoomCreate, ChatMessageCreate
from app.core.security import encryption_service
from app.services.nlp_service import nlp_service
from datetime import datetime, timedelta
import asyncio
import uuid
import secrets

def generate_anonymous_token() -> str:
    """匿名トークンを生成"""
    return secrets.token_urlsafe(32)

async def create_diary(db: Session, diary: DiaryCreate) -> Diary:
    """日記を作成（暗号化して保存）"""
    try:
        # 匿名トークンを生成（提供されていない場合）
        if not diary.anonymous_token:
            diary.anonymous_token = generate_anonymous_token()
        
        # 内容を暗号化
        encrypted_content = encryption_service.encrypt_text(diary.content)
        
        # 日記オブジェクトを作成
        db_diary = Diary(
            content=encrypted_content,
            emotion_tag=diary.emotion_tag if diary.emotion_tag else None,
            anonymous_token=diary.anonymous_token
        )
        
        # データベースに保存
        db.add(db_diary)
        db.commit()
        db.refresh(db_diary)
        
        # 非同期でNLP処理を実行
        asyncio.create_task(process_nlp_async(db, db_diary.id, diary.content))
        
        return db_diary
    except Exception as e:
        db.rollback()
        print(f"Error creating diary: {e}")
        raise e

async def process_nlp_async(db: Session, diary_id: str, original_content: str):
    """非同期でNLP処理を実行"""
    try:
        # キーワード抽出（NLPサービスが利用できない場合は空のリストを使用）
        try:
            keywords = await nlp_service.extract_keywords_async(original_content)
        except AttributeError:
            # extract_keywords_asyncメソッドが存在しない場合
            keywords = []
            print("NLP service extract_keywords_async method not available")
        except Exception as e:
            keywords = []
            print(f"NLP processing error: {e}")
        
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

def get_diaries_by_token(db: Session, anonymous_token: str, limit: int = 50) -> list[Diary]:
    """匿名トークンで日記を取得"""
    diaries = db.query(Diary).filter(
        and_(
            Diary.anonymous_token == anonymous_token,
            Diary.expires_at > datetime.utcnow()
        )
    ).order_by(Diary.created_at.desc()).limit(limit).all()
    
    # 内容を復号化
    for diary in diaries:
        diary.content = encryption_service.decrypt_text(diary.content)
    
    return diaries

def cleanup_expired_diaries(db: Session) -> int:
    """期限切れの日記を削除"""
    try:
        expired_diaries = db.query(Diary).filter(
            Diary.expires_at <= datetime.utcnow()
        ).all()
        
        deleted_count = len(expired_diaries)
        for diary in expired_diaries:
            db.delete(diary)
        
        db.commit()
        return deleted_count
        
    except Exception as e:
        print(f"Cleanup error: {e}")
        db.rollback()
        return 0

# チャットルーム関連のCRUD操作
def create_chat_room(db: Session, room_data: ChatRoomCreate) -> ChatRoom:
    """チャットルームを作成"""
    room = ChatRoom(
        empathy_words=room_data.empathy_words,
        participants=room_data.participants,
        max_participants=room_data.max_participants
    )
    
    db.add(room)
    db.commit()
    db.refresh(room)
    return room

def get_chat_room(db: Session, room_id: str) -> ChatRoom:
    """チャットルームを取得"""
    return db.query(ChatRoom).filter(ChatRoom.id == room_id).first()

def get_active_chat_rooms(db: Session, anonymous_token: str) -> list[ChatRoom]:
    """ユーザーが参加しているアクティブなチャットルームを取得"""
    from sqlalchemy import text
    
    # デバッグ用: 全チャットルームを取得してログ出力
    all_rooms = db.query(ChatRoom).filter(
        and_(
            ChatRoom.is_active == True,
            ChatRoom.expires_at > datetime.utcnow()
        )
    ).all()
    
    print(f"DEBUG: 全アクティブルーム数: {len(all_rooms)}")
    for room in all_rooms:
        print(f"DEBUG: ルーム {room.id} - 参加者: {room.participants}")
    
    # JSONB配列で要素を含むかチェック
    rooms = db.query(ChatRoom).filter(
        and_(
            ChatRoom.is_active == True,
            ChatRoom.expires_at > datetime.utcnow(),
            text("participants @> :token")
        )
    ).params(token=f'["{anonymous_token}"]').all()
    
    print(f"DEBUG: フィルタ後ルーム数: {len(rooms)}")
    return rooms

def create_chat_message(db: Session, room_id: str, message_data: ChatMessageCreate) -> ChatMessage:
    """チャットメッセージを作成"""
    # メッセージを暗号化
    encrypted_content = encryption_service.encrypt_text(message_data.content)
    
    message = ChatMessage(
        room_id=room_id,
        anonymous_token=message_data.anonymous_token,
        content=encrypted_content
    )
    
    db.add(message)
    db.commit()
    db.refresh(message)
    return message

def get_chat_messages(db: Session, room_id: str, limit: int = 100) -> list[ChatMessage]:
    """チャットメッセージを取得（復号化）"""
    messages = db.query(ChatMessage).filter(
        and_(
            ChatMessage.room_id == room_id,
            ChatMessage.expires_at > datetime.utcnow()
        )
    ).order_by(ChatMessage.created_at.asc()).limit(limit).all()
    
    # メッセージを復号化
    for message in messages:
        message.content = encryption_service.decrypt_text(message.content)
    
    return messages

def cleanup_expired_chat_messages(db: Session) -> int:
    """期限切れのチャットメッセージを削除"""
    try:
        expired_messages = db.query(ChatMessage).filter(
            ChatMessage.expires_at <= datetime.utcnow()
        ).all()
        
        deleted_count = len(expired_messages)
        for message in expired_messages:
            db.delete(message)
        
        db.commit()
        return deleted_count
        
    except Exception as e:
        print(f"Chat message cleanup error: {e}")
        db.rollback()
        return 0

def cleanup_expired_chat_rooms(db: Session) -> int:
    """期限切れのチャットルームを非アクティブにする"""
    try:
        expired_rooms = db.query(ChatRoom).filter(
            and_(
                ChatRoom.expires_at <= datetime.utcnow(),
                ChatRoom.is_active == True
            )
        ).all()
        
        cleanup_count = 0
        for room in expired_rooms:
            room.is_active = False
            cleanup_count += 1
        
        db.commit()
        return cleanup_count
        
    except Exception as e:
        print(f"Chat room cleanup error: {e}")
        db.rollback()
        return 0

# 通知関連のCRUD操作
def create_notification(db: Session, anonymous_token: str, notification_type: str, 
                       title: str, message: str, data: dict = None) -> Notification:
    """通知を作成"""
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
    return notification

def get_notifications(db: Session, anonymous_token: str, limit: int = 50) -> list[Notification]:
    """通知を取得"""
    return db.query(Notification).filter(
        and_(
            Notification.anonymous_token == anonymous_token,
            Notification.expires_at > datetime.utcnow()
        )
    ).order_by(Notification.created_at.desc()).limit(limit).all()

def mark_notification_as_read(db: Session, notification_id: str, anonymous_token: str) -> bool:
    """通知を既読にする"""
    notification = db.query(Notification).filter(
        and_(
            Notification.id == notification_id,
            Notification.anonymous_token == anonymous_token
        )
    ).first()
    
    if notification:
        notification.is_read = True
        db.commit()
        return True
    
    return False

def cleanup_expired_notifications(db: Session) -> int:
    """期限切れの通知を削除"""
    try:
        expired_notifications = db.query(Notification).filter(
            Notification.expires_at <= datetime.utcnow()
        ).all()
        
        deleted_count = len(expired_notifications)
        for notification in expired_notifications:
            db.delete(notification)
        
        db.commit()
        return deleted_count
        
    except Exception as e:
        print(f"Notification cleanup error: {e}")
        db.rollback()
        return 0

def delete_notification(db: Session, notification_id: str, anonymous_token: str) -> bool:
    """通知を削除"""
    try:
        notification = db.query(Notification).filter(
            and_(
                Notification.id == notification_id,
                Notification.anonymous_token == anonymous_token
            )
        ).first()
        
        if notification:
            db.delete(notification)
            db.commit()
            return True
        
        return False
        
    except Exception as e:
        print(f"Notification deletion error: {e}")
        db.rollback()
        return False

def get_notifications_by_type(db: Session, anonymous_token: str, notification_type: str, limit: int = 20) -> list[Notification]:
    """特定タイプの通知を取得"""
    return db.query(Notification).filter(
        and_(
            Notification.anonymous_token == anonymous_token,
            Notification.type == notification_type,
            Notification.expires_at > datetime.utcnow()
        )
    ).order_by(Notification.created_at.desc()).limit(limit).all()

def get_unread_notifications_count(db: Session, anonymous_token: str) -> int:
    """未読通知数を取得"""
    return db.query(Notification).filter(
        and_(
            Notification.anonymous_token == anonymous_token,
            Notification.is_read == False,
            Notification.expires_at > datetime.utcnow()
        )
    ).count()

def mark_all_notifications_as_read(db: Session, anonymous_token: str) -> int:
    """すべての通知を既読にする"""
    try:
        notifications = db.query(Notification).filter(
            and_(
                Notification.anonymous_token == anonymous_token,
                Notification.is_read == False,
                Notification.expires_at > datetime.utcnow()
            )
        ).all()
        
        read_count = 0
        for notification in notifications:
            notification.is_read = True
            read_count += 1
        
        db.commit()
        return read_count
        
    except Exception as e:
        print(f"Mark all notifications as read error: {e}")
        db.rollback()
        return 0 