from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.db.models import ChatRoom, ChatMessage, Notification
from app.db.crud import get_active_chat_rooms, get_chat_messages, create_chat_message, get_chat_room
from app.schemas.diary import ChatMessageCreate, ChatMessageResponse, ChatRoomResponse
from app.core.security import encryption_service
from datetime import datetime, timedelta
from typing import List, Optional
import logging
import uuid

logger = logging.getLogger(__name__)

class ChatService:
    def __init__(self):
        self.message_expiry_hours = 48  # メッセージの有効期限（48時間）
        self.room_expiry_hours = 24  # ルームの有効期限（24時間）
    
    def get_active_rooms(self, db: Session, anonymous_token: str) -> List[ChatRoomResponse]:
        """参加可能なチャットルーム一覧を取得"""
        try:
            logger.info(f"get_active_rooms呼び出し: anonymous_token={anonymous_token}")
            
            # CRUD層の関数を使用
            rooms = get_active_chat_rooms(db, anonymous_token)
            logger.info(f"get_active_chat_rooms結果: {len(rooms)}件")
            
            # 各ルームの参加者をログ出力
            for i, room in enumerate(rooms):
                logger.info(f"ルーム{i+1}: participants={room.participants}")
            
            return [ChatRoomResponse.model_validate(room) for room in rooms]
            
        except Exception as e:
            logger.error(f"チャットルーム取得エラー: {e}")
            return []
    
    def get_room_messages(self, db: Session, room_id: str, anonymous_token: str) -> List[ChatMessageResponse]:
        """チャットルームのメッセージを取得"""
        try:
            # ルームの存在確認と参加権限チェック
            room = get_chat_room(db, room_id)
            if not room or not room.is_active or room.expires_at <= datetime.utcnow():
                return []
            
            # 参加権限チェック
            if anonymous_token not in room.participants:
                return []
            
            # CRUD層の関数を使用してメッセージを取得
            messages = get_chat_messages(db, room_id)
            return [ChatMessageResponse.model_validate(message) for message in messages]
            
        except Exception as e:
            logger.error(f"メッセージ取得エラー: {e}")
            return []
    
    async def send_message(self, db: Session, room_id: str, message_data: ChatMessageCreate) -> Optional[ChatMessageResponse]:
        """メッセージを送信"""
        try:
            logger.info(f"send_message呼び出し: room_id={room_id}, token={message_data.anonymous_token}")
            
            # ルームの存在確認と参加権限チェック
            room = get_chat_room(db, room_id)
            if not room or not room.is_active or room.expires_at <= datetime.utcnow():
                logger.warning(f"ルームが存在しないか無効: {room_id}")
                return None
            
            logger.info(f"ルーム参加者: {room.participants}")
            
            # 参加権限チェック
            if message_data.anonymous_token not in room.participants:
                logger.warning(f"ルームアクセス権限なし: {room_id}, token: {message_data.anonymous_token}")
                return None
            
            # CRUD層の関数を使用してメッセージを作成
            message = create_chat_message(db, room_id, message_data)
            
            # メッセージを復号化してレスポンス用に準備
            message.content = message_data.content
            
            # 他の参加者に通知を送信
            await self._send_message_notifications(db, room, message_data.anonymous_token)
            
            logger.info(f"メッセージ送信: {message.id}, room: {room_id}")
            return ChatMessageResponse.model_validate(message)
            
        except Exception as e:
            logger.error(f"メッセージ送信エラー: {e}")
            return None
    
    async def _send_message_notifications(self, db: Session, room: ChatRoom, sender_token: str):
        """メッセージ受信通知を送信"""
        try:
            for token in room.participants:
                if token != sender_token:  # 送信者以外に通知
                    notification = Notification(
                        anonymous_token=token,
                        type="new_message",
                        title="新しいメッセージがあります",
                        message="共感ルームに新しいメッセージが投稿されました。",
                        data={
                            "room_id": room.id,
                            "sender_token": sender_token
                        }
                    )
                    db.add(notification)
            
            db.commit()
            
        except Exception as e:
            logger.error(f"メッセージ通知送信エラー: {e}")
            db.rollback()
    
    def cleanup_expired_rooms(self, db: Session) -> int:
        """期限切れのチャットルームをクリーンアップ"""
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
                
                # 参加者にルーム終了通知を送信
                self._send_room_closed_notifications(db, room)
            
            db.commit()
            logger.info(f"期限切れルームクリーンアップ: {cleanup_count}件")
            return cleanup_count
            
        except Exception as e:
            logger.error(f"ルームクリーンアップエラー: {e}")
            db.rollback()
            return 0
    
    def cleanup_expired_messages(self, db: Session) -> int:
        """期限切れのメッセージをクリーンアップ"""
        try:
            expired_messages = db.query(ChatMessage).filter(
                ChatMessage.expires_at <= datetime.utcnow()
            ).all()
            
            cleanup_count = len(expired_messages)
            for message in expired_messages:
                db.delete(message)
            
            db.commit()
            logger.info(f"期限切れメッセージクリーンアップ: {cleanup_count}件")
            return cleanup_count
            
        except Exception as e:
            logger.error(f"メッセージクリーンアップエラー: {e}")
            db.rollback()
            return 0
    
    def _send_room_closed_notifications(self, db: Session, room: ChatRoom):
        """ルーム終了通知を送信"""
        try:
            for token in room.participants:
                notification = Notification(
                    anonymous_token=token,
                    type="room_closed",
                    title="共感ルームが終了しました",
                    message="24時間の制限時間が経過し、共感ルームが終了しました。",
                    data={
                        "room_id": room.id,
                        "empathy_words": room.empathy_words
                    }
                )
                db.add(notification)
            
            db.commit()
            
        except Exception as e:
            logger.error(f"ルーム終了通知送信エラー: {e}")
            db.rollback()
    
    def get_room_info(self, db: Session, room_id: str, anonymous_token: str) -> Optional[ChatRoomResponse]:
        """チャットルーム情報を取得"""
        try:
            room = get_chat_room(db, room_id)
            if not room or not room.is_active or room.expires_at <= datetime.utcnow():
                return None
            
            # 参加権限チェック
            if anonymous_token not in room.participants:
                return None
            
            return ChatRoomResponse.model_validate(room)
            
        except Exception as e:
            logger.error(f"ルーム情報取得エラー: {e}")
            return None
    
    def check_room_expiry_warning(self, db: Session) -> List[str]:
        """1時間後に期限切れになるルームをチェック"""
        try:
            warning_time = datetime.utcnow() + timedelta(hours=1)
            warning_rooms = db.query(ChatRoom).filter(
                and_(
                    ChatRoom.is_active == True,
                    ChatRoom.expires_at <= warning_time,
                    ChatRoom.expires_at > datetime.utcnow()
                )
            ).all()
            
            room_ids = []
            for room in warning_rooms:
                # 参加者に警告通知を送信
                for token in room.participants:
                    notification = Notification(
                        anonymous_token=token,
                        type="room_expiry_warning",
                        title="ルーム終了まで1時間です",
                        message="共感ルームが1時間後に終了します。",
                        data={
                            "room_id": room.id,
                            "expires_at": room.expires_at.isoformat()
                        }
                    )
                    db.add(notification)
                
                room_ids.append(room.id)
            
            db.commit()
            logger.info(f"ルーム終了警告通知: {len(room_ids)}件")
            return room_ids
            
        except Exception as e:
            logger.error(f"ルーム終了警告チェックエラー: {e}")
            db.rollback()
            return []

chat_service = ChatService() 