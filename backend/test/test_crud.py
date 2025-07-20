import pytest
from datetime import datetime, timedelta
from app.db.crud import (
    create_diary, get_diary, get_recent_diaries, get_diaries_by_token,
    cleanup_expired_diaries, create_chat_room, get_chat_room,
    get_active_chat_rooms, create_chat_message, get_chat_messages,
    cleanup_expired_chat_messages, cleanup_expired_chat_rooms,
    create_notification, get_notifications, mark_notification_as_read,
    cleanup_expired_notifications
)
from app.schemas.diary import DiaryCreate, ChatRoomCreate, ChatMessageCreate
from app.db.models import Diary, ChatRoom, ChatMessage, Notification
from app.core.security import encryption_service

class TestDiaryCRUD:
    """日記CRUD操作のテスト"""
    
    @pytest.mark.asyncio
    async def test_create_diary(self, db_session):
        """日記作成のテスト"""
        diary_data = DiaryCreate(
            content="テスト日記の内容",
            emotion_tag="happy",
            anonymous_token="test_token_123"
        )
        
        diary = await create_diary(db_session, diary_data)
        
        assert diary.id is not None
        # 暗号化されているため、復号化して比較
        decrypted_content = encryption_service.decrypt_text(diary.content)
        assert decrypted_content == "テスト日記の内容"
        assert diary.emotion_tag == "happy"
        assert diary.anonymous_token == "test_token_123"
    
    def test_get_diary(self, db_session):
        """日記取得のテスト"""
        # 暗号化されたテストデータを作成
        encrypted_content = encryption_service.encrypt_text("テスト日記")
        diary = Diary(
            content=encrypted_content,
            anonymous_token="test_token_123"
        )
        db_session.add(diary)
        db_session.commit()
        
        # 取得テスト
        retrieved_diary = get_diary(db_session, diary.id)
        assert retrieved_diary is not None
        assert retrieved_diary.id == diary.id
        assert retrieved_diary.content == "テスト日記"
    
    def test_get_recent_diaries(self, db_session):
        """最近の日記取得のテスト"""
        # 暗号化された複数のテストデータを作成
        for i in range(3):
            encrypted_content = encryption_service.encrypt_text(f"テスト日記{i}")
            diary = Diary(
                content=encrypted_content,
                anonymous_token=f"token_{i}"
            )
            db_session.add(diary)
        db_session.commit()
        
        # 取得テスト
        diaries = get_recent_diaries(db_session, limit=2)
        assert len(diaries) == 2
        assert diaries[0].created_at >= diaries[1].created_at  # 新しい順
    
    def test_get_diaries_by_token(self, db_session):
        """匿名トークンによる日記取得のテスト"""
        # 暗号化されたテストデータを作成
        encrypted_content1 = encryption_service.encrypt_text("テスト日記1")
        encrypted_content2 = encryption_service.encrypt_text("テスト日記2")
        encrypted_content3 = encryption_service.encrypt_text("他の人の日記")
        
        diary1 = Diary(
            content=encrypted_content1,
            anonymous_token="test_token_123"
        )
        diary2 = Diary(
            content=encrypted_content2,
            anonymous_token="test_token_123"
        )
        diary3 = Diary(
            content=encrypted_content3,
            anonymous_token="other_token"
        )
        
        db_session.add_all([diary1, diary2, diary3])
        db_session.commit()
        
        # 取得テスト
        diaries = get_diaries_by_token(db_session, "test_token_123")
        assert len(diaries) == 2
        assert all(d.anonymous_token == "test_token_123" for d in diaries)
    
    def test_cleanup_expired_diaries(self, db_session):
        """期限切れ日記のクリーンアップテスト"""
        # 期限切れの日記を作成
        expired_diary = Diary(
            content=encryption_service.encrypt_text("期限切れ日記"),
            anonymous_token="test_token",
            expires_at=datetime.utcnow() - timedelta(hours=1)
        )
        
        # 有効な日記を作成
        valid_diary = Diary(
            content=encryption_service.encrypt_text("有効な日記"),
            anonymous_token="test_token",
            expires_at=datetime.utcnow() + timedelta(hours=1)
        )
        
        db_session.add_all([expired_diary, valid_diary])
        db_session.commit()
        
        # クリーンアップ実行
        deleted_count = cleanup_expired_diaries(db_session)
        assert deleted_count == 1
        
        # 確認
        remaining_diaries = db_session.query(Diary).all()
        assert len(remaining_diaries) == 1
        decrypted_content = encryption_service.decrypt_text(remaining_diaries[0].content)
        assert decrypted_content == "有効な日記"

class TestChatRoomCRUD:
    """チャットルームCRUD操作のテスト"""
    
    def test_create_chat_room(self, db_session):
        """チャットルーム作成のテスト"""
        room_data = ChatRoomCreate(
            empathy_words=[
                {"word": "天気", "frequency": 2, "importance_score": 0.8}
            ],
            participants=["token1", "token2"],
            max_participants=5
        )
        
        room = create_chat_room(db_session, room_data)
        
        assert room.id is not None
        assert room.empathy_words == room_data.empathy_words
        assert room.participants == room_data.participants
        assert room.max_participants == 5
    
    def test_get_chat_room(self, db_session):
        """チャットルーム取得のテスト"""
        room = ChatRoom(
            empathy_words=[],
            participants=["token1"]
        )
        db_session.add(room)
        db_session.commit()
        
        retrieved_room = get_chat_room(db_session, room.id)
        assert retrieved_room is not None
        assert retrieved_room.id == room.id
    
    def test_get_active_chat_rooms(self, db_session):
        """アクティブなチャットルーム取得のテスト"""
        # アクティブなルーム
        active_room = ChatRoom(
            empathy_words=[],
            participants=["token1"],
            is_active=True,
            expires_at=datetime.utcnow() + timedelta(hours=1)
        )
        
        # 非アクティブなルーム
        inactive_room = ChatRoom(
            empathy_words=[],
            participants=["token1"],
            is_active=False
        )
        
        # 期限切れのルーム
        expired_room = ChatRoom(
            empathy_words=[],
            participants=["token1"],
            is_active=True,
            expires_at=datetime.utcnow() - timedelta(hours=1)
        )
        
        db_session.add_all([active_room, inactive_room, expired_room])
        db_session.commit()
        
        # 取得テスト
        active_rooms = get_active_chat_rooms(db_session, "token1")
        assert len(active_rooms) == 1
        assert active_rooms[0].id == active_room.id

class TestChatMessageCRUD:
    """チャットメッセージCRUD操作のテスト"""
    
    def test_create_chat_message(self, db_session):
        """チャットメッセージ作成のテスト"""
        # ルームを作成
        room = ChatRoom(
            empathy_words=[],
            participants=["token1"]
        )
        db_session.add(room)
        db_session.commit()
        
        message_data = ChatMessageCreate(
            content="テストメッセージ",
            anonymous_token="token1"
        )
        
        message = create_chat_message(db_session, room.id, message_data)
        
        assert message.id is not None
        assert message.room_id == room.id
        # 暗号化されているため、復号化して比較
        decrypted_content = encryption_service.decrypt_text(message.content)
        assert decrypted_content == "テストメッセージ"
        assert message.anonymous_token == "token1"
    
    def test_get_chat_messages(self, db_session):
        """チャットメッセージ取得のテスト"""
        # ルームを作成
        room = ChatRoom(
            empathy_words=[],
            participants=["token1"]
        )
        db_session.add(room)
        db_session.commit()
        
        # 暗号化されたメッセージを作成
        encrypted_content1 = encryption_service.encrypt_text("メッセージ1")
        encrypted_content2 = encryption_service.encrypt_text("メッセージ2")
        
        message1 = ChatMessage(
            room_id=room.id,
            anonymous_token="token1",
            content=encrypted_content1
        )
        message2 = ChatMessage(
            room_id=room.id,
            anonymous_token="token1",
            content=encrypted_content2
        )
        
        db_session.add_all([message1, message2])
        db_session.commit()
        
        # 取得テスト
        messages = get_chat_messages(db_session, room.id)
        assert len(messages) == 2
        assert messages[0].content == "メッセージ1"
        assert messages[1].content == "メッセージ2"
    
    def test_cleanup_expired_chat_messages(self, db_session):
        """期限切れチャットメッセージのクリーンアップテスト"""
        # ルームを作成
        room = ChatRoom(
            empathy_words=[],
            participants=["token1"]
        )
        db_session.add(room)
        db_session.commit()
        
        # 期限切れメッセージ
        expired_message = ChatMessage(
            room_id=room.id,
            anonymous_token="token1",
            content=encryption_service.encrypt_text("期限切れメッセージ"),
            expires_at=datetime.utcnow() - timedelta(hours=1)
        )
        
        # 有効なメッセージ
        valid_message = ChatMessage(
            room_id=room.id,
            anonymous_token="token1",
            content=encryption_service.encrypt_text("有効なメッセージ"),
            expires_at=datetime.utcnow() + timedelta(hours=1)
        )
        
        db_session.add_all([expired_message, valid_message])
        db_session.commit()
        
        # クリーンアップ実行
        deleted_count = cleanup_expired_chat_messages(db_session)
        assert deleted_count == 1
        
        # 確認
        remaining_messages = db_session.query(ChatMessage).all()
        assert len(remaining_messages) == 1
        decrypted_content = encryption_service.decrypt_text(remaining_messages[0].content)
        assert decrypted_content == "有効なメッセージ"
    
    def test_cleanup_expired_chat_rooms(self, db_session):
        """期限切れチャットルームのクリーンアップテスト"""
        # 期限切れルーム
        expired_room = ChatRoom(
            empathy_words=[],
            participants=["token1"],
            is_active=True,
            expires_at=datetime.utcnow() - timedelta(hours=1)
        )
        
        # 有効なルーム
        valid_room = ChatRoom(
            empathy_words=[],
            participants=["token1"],
            is_active=True,
            expires_at=datetime.utcnow() + timedelta(hours=1)
        )
        
        db_session.add_all([expired_room, valid_room])
        db_session.commit()
        
        # クリーンアップ実行
        cleanup_count = cleanup_expired_chat_rooms(db_session)
        assert cleanup_count == 1
        
        # 確認
        db_session.refresh(expired_room)
        db_session.refresh(valid_room)
        assert expired_room.is_active == False
        assert valid_room.is_active == True

class TestNotificationCRUD:
    """通知CRUD操作のテスト"""
    
    def test_create_notification(self, db_session):
        """通知作成のテスト"""
        notification = create_notification(
            db_session,
            "test_token",
            "matching_success",
            "テスト通知",
            "テストメッセージ",
            {"room_id": "test_room"}
        )
        
        assert notification.id is not None
        assert notification.anonymous_token == "test_token"
        assert notification.type == "matching_success"
        assert notification.title == "テスト通知"
        assert notification.message == "テストメッセージ"
        assert notification.data == {"room_id": "test_room"}
    
    def test_get_notifications(self, db_session):
        """通知取得のテスト"""
        # 複数の通知を作成
        for i in range(3):
            notification = Notification(
                anonymous_token="test_token",
                type="test",
                title=f"テスト通知{i}",
                message=f"テストメッセージ{i}"
            )
            db_session.add(notification)
        db_session.commit()
        
        # 取得テスト
        notifications = get_notifications(db_session, "test_token", limit=2)
        assert len(notifications) == 2
    
    def test_mark_notification_as_read(self, db_session):
        """通知既読設定のテスト"""
        notification = Notification(
            anonymous_token="test_token",
            type="test",
            title="テスト通知",
            message="テストメッセージ"
        )
        db_session.add(notification)
        db_session.commit()
        
        # 既読設定
        success = mark_notification_as_read(db_session, notification.id, "test_token")
        assert success == True
        
        # 確認
        db_session.refresh(notification)
        assert notification.is_read == True
    
    def test_cleanup_expired_notifications(self, db_session):
        """期限切れ通知のクリーンアップテスト"""
        # 期限切れ通知
        expired_notification = Notification(
            anonymous_token="test_token",
            type="test",
            title="期限切れ通知",
            message="テストメッセージ",
            expires_at=datetime.utcnow() - timedelta(hours=1)
        )
        
        # 有効な通知
        valid_notification = Notification(
            anonymous_token="test_token",
            type="test",
            title="有効な通知",
            message="テストメッセージ",
            expires_at=datetime.utcnow() + timedelta(hours=1)
        )
        
        db_session.add_all([expired_notification, valid_notification])
        db_session.commit()
        
        # クリーンアップ実行
        deleted_count = cleanup_expired_notifications(db_session)
        assert deleted_count == 1
        
        # 確認
        remaining_notifications = db_session.query(Notification).all()
        assert len(remaining_notifications) == 1
        assert remaining_notifications[0].title == "有効な通知" 