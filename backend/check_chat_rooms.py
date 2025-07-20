#!/usr/bin/env python3
"""
データベース内のチャットルームを確認するスクリプト
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.db.models import ChatRoom, ChatMessage
from datetime import datetime

def check_chat_rooms():
    """チャットルームの状況を確認"""
    db = SessionLocal()
    
    try:
        print("=== チャットルーム状況確認 ===")
        
        # 全チャットルームを取得
        rooms = db.query(ChatRoom).all()
        print(f"\n📊 チャットルーム数: {len(rooms)}件")
        
        for i, room in enumerate(rooms, 1):
            print(f"\n🏠 チャットルーム {i}:")
            print(f"   ID: {room.id}")
            print(f"   共感ワード: {room.empathy_words}")
            print(f"   参加者数: {len(room.participants)}")
            print(f"   参加者: {room.participants}")
            print(f"   作成日時: {room.created_at}")
            print(f"   有効期限: {room.expires_at}")
            print(f"   アクティブ: {room.is_active}")
            
            # メッセージ数を確認
            messages = db.query(ChatMessage).filter(ChatMessage.room_id == room.id).all()
            print(f"   メッセージ数: {len(messages)}件")
        
        # テスト用トークンが含まれているか確認
        test_tokens = [
            "test_token_user_1_abcdefghijklmnop",
            "test_token_user_2_qrstuvwxyz123456", 
            "test_token_user_3_7890123456789012"
        ]
        
        print(f"\n🔍 テスト用トークンの確認:")
        for token in test_tokens:
            found_rooms = [room for room in rooms if token in room.participants]
            print(f"   {token}: {len(found_rooms)}件のルームに参加")
        
        return rooms
        
    except Exception as e:
        print(f"❌ エラー: {e}")
        return []
    finally:
        db.close()

if __name__ == "__main__":
    rooms = check_chat_rooms()
    
    if not rooms:
        print("\n❌ チャットルームが見つかりません")
        print("   テスト用チャットルームを作成してください:")
        print("   python create_test_chat_room.py")
    else:
        print("\n✅ チャットルームが存在します") 