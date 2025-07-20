import pytest
from datetime import datetime, timedelta
from app.db.models import Diary, ChatRoom, ChatMessage, Notification
from app.db.crud import generate_anonymous_token

class TestDiaryModel:
    """日記モデルのテスト"""
    
    def test_create_diary(self, db_session):
        """日記作成のテスト"""
        diary = Diary(
            content="テスト日記の内容",
            emotion_tag="happy",
            anonymous_token="test_token_123"
        )
        
        db_session.add(diary)
        db_session.commit()
        db_session.refresh(diary)
        
        assert diary.id is not None
        assert diary.content == "テスト日記の内容"
        assert diary.emotion_tag == "happy"
        assert diary.anonymous_token == "test_token_123"
        assert diary.is_matched == False
        assert diary.created_at is not None
        assert diary.expires_at > datetime.utcnow()
    
    def test_diary_expires_at(self, db_session):
        """日記の有効期限テスト"""
        diary = Diary(
            content="テスト日記",
            anonymous_token="test_token_123"
        )
        
        db_session.add(diary)
        db_session.commit()
        
        # 24時間後の有効期限が設定されているか
        expected_expiry = datetime.utcnow() + timedelta(hours=24)
        assert abs((diary.expires_at - expected_expiry).total_seconds()) < 60  # 1分以内

class TestChatRoomModel:
    """チャットルームモデルのテスト"""
    
    def test_create_chat_room(self, db_session):
        """チャットルーム作成のテスト"""
        empathy_words = [
            {"word": "天気", "frequency": 2, "importance_score": 0.8},
            {"word": "散歩", "frequency": 1, "importance_score": 0.6}
        ]
        participants = ["token1", "token2", "token3"]
        
        room = ChatRoom(
            empathy_words=empathy_words,
            participants=participants,
            max_participants=5
        )
        
        db_session.add(room)
        db_session.commit()
        db_session.refresh(room)
        
        assert room.id is not None
        assert room.empathy_words == empathy_words
        assert room.participants == participants
        assert room.max_participants == 5
        assert room.is_active == True
        assert room.created_at is not None
        assert room.expires_at > datetime.utcnow()
    
    def test_chat_room_expires_at(self, db_session):
        """チャットルームの有効期限テスト"""
        room = ChatRoom(
            empathy_words=[],
            participants=["token1"]
        )
        
        db_session.add(room)
        db_session.commit()
        
        # 24時間後の有効期限が設定されているか
        expected_expiry = datetime.utcnow() + timedelta(hours=24)
        assert abs((room.expires_at - expected_expiry).total_seconds()) < 60

class TestChatMessageModel:
    """チャットメッセージモデルのテスト"""
    
    def test_create_chat_message(self, db_session):
        """チャットメッセージ作成のテスト"""
        # まずチャットルームを作成
        room = ChatRoom(
            empathy_words=[],
            participants=["token1"]
        )
        db_session.add(room)
        db_session.commit()
        
        message = ChatMessage(
            room_id=room.id,
            anonymous_token="token1",
            content="テストメッセージ"
        )
        
        db_session.add(message)
        db_session.commit()
        db_session.refresh(message)
        
        assert message.id is not None
        assert message.room_id == room.id
        assert message.anonymous_token == "token1"
        assert message.content == "テストメッセージ"
        assert message.created_at is not None
        assert message.expires_at > datetime.utcnow()
    
    def test_chat_message_expires_at(self, db_session):
        """チャットメッセージの有効期限テスト"""
        room = ChatRoom(
            empathy_words=[],
            participants=["token1"]
        )
        db_session.add(room)
        db_session.commit()
        
        message = ChatMessage(
            room_id=room.id,
            anonymous_token="token1",
            content="テストメッセージ"
        )
        
        db_session.add(message)
        db_session.commit()
        
        # 48時間後の有効期限が設定されているか
        expected_expiry = datetime.utcnow() + timedelta(hours=48)
        assert abs((message.expires_at - expected_expiry).total_seconds()) < 60

class TestNotificationModel:
    """通知モデルのテスト"""
    
    def test_create_notification(self, db_session):
        """通知作成のテスト"""
        notification = Notification(
            anonymous_token="token1",
            type="matching_success",
            title="テスト通知",
            message="テストメッセージ",
            data={"room_id": "test_room"}
        )
        
        db_session.add(notification)
        db_session.commit()
        db_session.refresh(notification)
        
        assert notification.id is not None
        assert notification.anonymous_token == "token1"
        assert notification.type == "matching_success"
        assert notification.title == "テスト通知"
        assert notification.message == "テストメッセージ"
        assert notification.data == {"room_id": "test_room"}
        assert notification.is_read == False
        assert notification.created_at is not None
        assert notification.expires_at > datetime.utcnow()
    
    def test_notification_expires_at(self, db_session):
        """通知の有効期限テスト"""
        notification = Notification(
            anonymous_token="token1",
            type="test",
            title="テスト",
            message="テスト"
        )
        
        db_session.add(notification)
        db_session.commit()
        
        # 7日後の有効期限が設定されているか
        expected_expiry = datetime.utcnow() + timedelta(days=7)
        assert abs((notification.expires_at - expected_expiry).total_seconds()) < 60

class TestAnonymousToken:
    """匿名トークンのテスト"""
    
    def test_generate_anonymous_token(self):
        """匿名トークン生成のテスト"""
        token1 = generate_anonymous_token()
        token2 = generate_anonymous_token()
        
        assert len(token1) >= 32
        assert token1 != token2
        assert isinstance(token1, str) 