#!/usr/bin/env python3
"""
チャットルーム検索のデバッグスクリプト
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.db.crud import get_active_chat_rooms
from datetime import datetime

def debug_chat_rooms():
    """チャットルーム検索をデバッグ"""
    db = SessionLocal()
    
    try:
        print("=== チャットルーム検索デバッグ ===")
        
        # テスト用トークン
        test_token = "test_token_user_1_abcdefghijklmnop"
        print(f"検索対象トークン: {test_token}")
        
        # 全チャットルームを取得
        from app.db.models import ChatRoom
        from sqlalchemy import and_
        
        all_rooms = db.query(ChatRoom).filter(
            and_(
                ChatRoom.is_active == True,
                ChatRoom.expires_at > datetime.utcnow()
            )
        ).all()
        
        print(f"\n📊 全アクティブルーム数: {len(all_rooms)}")
        
        for i, room in enumerate(all_rooms, 1):
            print(f"\n🏠 ルーム {i}:")
            print(f"   ID: {room.id}")
            print(f"   参加者: {room.participants}")
            print(f"   参加者タイプ: {type(room.participants)}")
            print(f"   トークンが含まれるか: {test_token in room.participants}")
        
        # get_active_chat_rooms関数をテスト
        print(f"\n🔍 get_active_chat_rooms関数のテスト:")
        rooms = get_active_chat_rooms(db, test_token)
        print(f"   結果: {len(rooms)}件")
        
        for i, room in enumerate(rooms, 1):
            print(f"   ルーム{i}: {room.id}")
        
        return rooms
        
    except Exception as e:
        print(f"❌ エラー: {e}")
        import traceback
        traceback.print_exc()
        return []
    finally:
        db.close()

if __name__ == "__main__":
    debug_chat_rooms() 