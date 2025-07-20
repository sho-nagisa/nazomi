import pytest
from datetime import datetime, timedelta
from app.services.matching_service import matching_service
from app.services.chat_service import chat_service
from app.services.notification_service import notification_service
from app.db.models import Diary, ChatRoom, ChatMessage, Notification
from app.schemas.diary import ChatMessageCreate

class TestMatchingService:
    """マッチングサービスのテスト"""
    
    def test_extract_keyword_set(self):
        """キーワードセット抽出のテスト"""
        keywords = [
            {"word": "天気", "importance_score": 0.8},
            {"word": "散歩", "importance_score": 0.6},
            {"word": "友達", "importance_score": 0.7}
        ]
        
        keyword_set = matching_service._extract_keyword_set(keywords)
        expected_set = {"天気", "散歩", "友達"}
        
        assert keyword_set == expected_set
    
    def test_calculate_similarity(self):
        """類似度計算のテスト"""
        keywords1 = {"天気", "散歩", "友達"}
        keywords2 = {"天気", "散歩", "公園"}
        
        similarity = matching_service._calculate_similarity(keywords1, keywords2)
        expected_similarity = 2 / 4  # 共通要素2個 / 全体4個
        
        assert similarity == expected_similarity
    
    def test_get_unmatched_diaries(self, db_session):
        """未マッチング日記取得のテスト"""
        # マッチング済み日記
        matched_diary = Diary(
            content="マッチング済み日記",
            anonymous_token="token1",
            is_matched=True,
            keywords=[{"word": "テスト", "importance_score": 0.5}]
        )
        
        # 未マッチング日記
        unmatched_diary = Diary(
            content="未マッチング日記",
            anonymous_token="token2",
            is_matched=False,
            keywords=[{"word": "テスト", "importance_score": 0.5}]
        )
        
        # キーワードなし日記
        no_keywords_diary = Diary(
            content="キーワードなし日記",
            anonymous_token="token3",
            is_matched=False,
            keywords=None
        )
        
        db_session.add_all([matched_diary, unmatched_diary, no_keywords_diary])
        db_session.commit()
        
        # 取得テスト
        unmatched_diaries = matching_service._get_unmatched_diaries(db_session)
        assert len(unmatched_diaries) == 1
        assert unmatched_diaries[0].id == unmatched_diary.id
    
    def test_group_by_time_window(self, db_session):
        """時間帯グループ化のテスト"""
        # 同じ時間帯の日記
        diary1 = Diary(
            content="日記1",
            anonymous_token="token1",
            created_at=datetime.utcnow()
        )
        diary2 = Diary(
            content="日記2",
            anonymous_token="token2",
            created_at=datetime.utcnow() + timedelta(hours=1)
        )
        
        # 異なる時間帯の日記
        diary3 = Diary(
            content="日記3",
            anonymous_token="token3",
            created_at=datetime.utcnow() + timedelta(hours=4)
        )
        
        diaries = [diary1, diary2, diary3]
        time_groups = matching_service._group_by_time_window(diaries)
        
        assert len(time_groups) == 2
        assert len(time_groups[0]) == 2  # diary1, diary2
        assert len(time_groups[1]) == 1  # diary3

class TestChatService:
    """チャットサービスのテスト"""
    
    def test_get_active_rooms(self, db_session):
        """アクティブなルーム取得のテスト"""
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
        
        db_session.add_all([active_room, inactive_room])
        db_session.commit()
        
        # 取得テスト
        rooms = chat_service.get_active_rooms(db_session, "token1")
        assert len(rooms) == 1
        assert rooms[0].id == active_room.id
    
    def test_get_room_messages(self, db_session):
        """ルームメッセージ取得のテスト"""
        # ルームを作成
        room = ChatRoom(
            empathy_words=[],
            participants=["token1"],
            is_active=True,
            expires_at=datetime.utcnow() + timedelta(hours=1)
        )
        db_session.add(room)
        db_session.commit()
        
        # メッセージを作成
        message1 = ChatMessage(
            room_id=room.id,
            anonymous_token="token1",
            content="メッセージ1",
            expires_at=datetime.utcnow() + timedelta(hours=1)
        )
        message2 = ChatMessage(
            room_id=room.id,
            anonymous_token="token1",
            content="メッセージ2",
            expires_at=datetime.utcnow() + timedelta(hours=1)
        )
        
        db_session.add_all([message1, message2])
        db_session.commit()
        
        # 取得テスト
        messages = chat_service.get_room_messages(db_session, room.id, "token1")
        assert len(messages) == 2
        assert messages[0].content == "メッセージ1"
        assert messages[1].content == "メッセージ2"
    
    @pytest.mark.asyncio
    async def test_send_message(self, db_session):
        """メッセージ送信のテスト"""
        # ルームを作成
        room = ChatRoom(
            empathy_words=[],
            participants=["token1"],
            is_active=True,
            expires_at=datetime.utcnow() + timedelta(hours=1)
        )
        db_session.add(room)
        db_session.commit()
        
        # メッセージデータ
        message_data = ChatMessageCreate(
            content="テストメッセージ",
            anonymous_token="token1"
        )
        
        # 送信テスト
        message = await chat_service.send_message(db_session, room.id, message_data)
        assert message is not None
        assert message.content == "テストメッセージ"
        assert message.anonymous_token == "token1"
    
    def test_cleanup_expired_rooms(self, db_session):
        """期限切れルームクリーンアップのテスト"""
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
        cleanup_count = chat_service.cleanup_expired_rooms(db_session)
        assert cleanup_count == 1
        
        # 確認
        db_session.refresh(expired_room)
        db_session.refresh(valid_room)
        assert expired_room.is_active == False
        assert valid_room.is_active == True
    
    def test_cleanup_expired_messages(self, db_session):
        """期限切れメッセージクリーンアップのテスト"""
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
            content="期限切れメッセージ",
            expires_at=datetime.utcnow() - timedelta(hours=1)
        )
        
        # 有効なメッセージ
        valid_message = ChatMessage(
            room_id=room.id,
            anonymous_token="token1",
            content="有効なメッセージ",
            expires_at=datetime.utcnow() + timedelta(hours=1)
        )
        
        db_session.add_all([expired_message, valid_message])
        db_session.commit()
        
        # クリーンアップ実行
        deleted_count = chat_service.cleanup_expired_messages(db_session)
        assert deleted_count == 1
        
        # 確認
        remaining_messages = db_session.query(ChatMessage).all()
        assert len(remaining_messages) == 1
        assert remaining_messages[0].content == "有効なメッセージ"

class TestNotificationService:
    """通知サービスのテスト"""
    
    def test_get_notifications(self, db_session):
        """通知取得のテスト"""
        # 複数の通知を作成
        for i in range(3):
            notification = Notification(
                anonymous_token="token1",
                type="test",
                title=f"テスト通知{i}",
                message=f"テストメッセージ{i}",
                expires_at=datetime.utcnow() + timedelta(hours=1)
            )
            db_session.add(notification)
        db_session.commit()
        
        # 取得テスト
        notifications = notification_service.get_notifications(db_session, "token1", limit=2)
        assert len(notifications) == 2
    
    def test_get_unread_count(self, db_session):
        """未読通知数取得のテスト"""
        # 未読通知
        unread_notification = Notification(
            anonymous_token="token1",
            type="test",
            title="未読通知",
            message="テストメッセージ",
            is_read=False,
            expires_at=datetime.utcnow() + timedelta(hours=1)
        )
        
        # 既読通知
        read_notification = Notification(
            anonymous_token="token1",
            type="test",
            title="既読通知",
            message="テストメッセージ",
            is_read=True,
            expires_at=datetime.utcnow() + timedelta(hours=1)
        )
        
        db_session.add_all([unread_notification, read_notification])
        db_session.commit()
        
        # 取得テスト
        unread_count = notification_service.get_unread_count(db_session, "token1")
        assert unread_count == 1
    
    def test_mark_as_read(self, db_session):
        """通知既読設定のテスト"""
        notification = Notification(
            anonymous_token="token1",
            type="test",
            title="テスト通知",
            message="テストメッセージ",
            expires_at=datetime.utcnow() + timedelta(hours=1)
        )
        db_session.add(notification)
        db_session.commit()
        
        # 既読設定
        success = notification_service.mark_as_read(db_session, notification.id, "token1")
        assert success == True
        
        # 確認
        db_session.refresh(notification)
        assert notification.is_read == True
    
    def test_mark_all_as_read(self, db_session):
        """全通知既読設定のテスト"""
        # 複数の未読通知を作成
        for i in range(3):
            notification = Notification(
                anonymous_token="token1",
                type="test",
                title=f"テスト通知{i}",
                message=f"テストメッセージ{i}",
                is_read=False,
                expires_at=datetime.utcnow() + timedelta(hours=1)
            )
            db_session.add(notification)
        db_session.commit()
        
        # 全既読設定
        read_count = notification_service.mark_all_as_read(db_session, "token1")
        assert read_count == 3
        
        # 確認
        notifications = db_session.query(Notification).filter_by(anonymous_token="token1").all()
        assert all(n.is_read == True for n in notifications)
    
    def test_create_notification(self, db_session):
        """通知作成のテスト"""
        notification = notification_service.create_notification(
            db_session,
            "token1",
            "matching_success",
            "テスト通知",
            "テストメッセージ",
            {"room_id": "test_room"}
        )
        
        assert notification is not None
        assert notification.anonymous_token == "token1"
        assert notification.type == "matching_success"
        assert notification.title == "テスト通知"
        assert notification.message == "テストメッセージ"
        assert notification.data == {"room_id": "test_room"}
    
    def test_cleanup_expired_notifications(self, db_session):
        """期限切れ通知クリーンアップのテスト"""
        # 期限切れ通知
        expired_notification = Notification(
            anonymous_token="token1",
            type="test",
            title="期限切れ通知",
            message="テストメッセージ",
            expires_at=datetime.utcnow() - timedelta(hours=1)
        )
        
        # 有効な通知
        valid_notification = Notification(
            anonymous_token="token1",
            type="test",
            title="有効な通知",
            message="テストメッセージ",
            expires_at=datetime.utcnow() + timedelta(hours=1)
        )
        
        db_session.add_all([expired_notification, valid_notification])
        db_session.commit()
        
        # クリーンアップ実行
        deleted_count = notification_service.cleanup_expired_notifications(db_session)
        assert deleted_count == 1
        
        # 確認
        remaining_notifications = db_session.query(Notification).all()
        assert len(remaining_notifications) == 1
        assert remaining_notifications[0].title == "有効な通知" 