#!/usr/bin/env python3
"""
テスト用チャットルームを作成するスクリプト
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.db.models import ChatRoom
from datetime import datetime, timedelta
import uuid

def create_test_chat_room():
    """テスト用チャットルームを作成"""
    db = SessionLocal()
    
    try:
        # テスト用の匿名トークンを生成
        test_tokens = [
            "test_token_user_1_abcdefghijklmnop",
            "test_token_user_2_qrstuvwxyz123456",
            "test_token_user_3_7890123456789012"
        ]
        
        # テスト用チャットルームを作成
        test_room = ChatRoom(
            id=str(uuid.uuid4()),
            empathy_words=[
                {"word": "気持ち", "frequency": 3, "importance_score": 0.8},
                {"word": "不安", "frequency": 2, "importance_score": 0.6}
            ],
            participants=test_tokens,
            created_at=datetime.utcnow(),
            expires_at=datetime.utcnow() + timedelta(hours=24),
            is_active=True,
            max_participants=5
        )
        
        db.add(test_room)
        db.commit()
        db.refresh(test_room)
        
        print(f"✅ テストチャットルーム作成成功:")
        print(f"   ID: {test_room.id}")
        print(f"   共感ワード: {test_room.empathy_words}")
        print(f"   参加者数: {len(test_room.participants)}")
        print(f"   参加者: {test_room.participants}")
        print(f"   有効期限: {test_room.expires_at}")
        print(f"   アクティブ: {test_room.is_active}")
        
        # テスト用の匿名トークンを表示
        print(f"\n📝 テスト用匿名トークン:")
        for i, token in enumerate(test_tokens, 1):
            print(f"   ユーザー{i}: {token}")
        
        return test_room.id
        
    except Exception as e:
        print(f"❌ エラー: {e}")
        db.rollback()
        return None
    finally:
        db.close()

if __name__ == "__main__":
    print("=== テストチャットルーム作成 ===")
    room_id = create_test_chat_room()
    
    if room_id:
        print(f"\n🎉 チャットルーム作成完了!")
        print(f"   ルームID: {room_id}")
        print(f"\n📋 次のステップ:")
        print(f"   1. ブラウザで http://localhost:5173 にアクセス")
        print(f"   2. チャットルーム画面に移動")
        print(f"   3. 上記のテスト用匿名トークンのいずれかを使用してメッセージ送信をテスト")
    else:
        print("❌ チャットルーム作成に失敗しました") 