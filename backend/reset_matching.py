#!/usr/bin/env python3
"""
日記のマッチング状態をリセットするスクリプト
"""

import requests
import json

def reset_matching():
    """マッチング状態をリセット"""
    base_url = "http://127.0.0.1:8000"
    
    print("=== マッチング状態リセット ===")
    
    # 1. 現在の日記データを確認
    print("\n1. 現在の日記データ:")
    response = requests.get(f"{base_url}/api/diaries")
    if response.status_code == 200:
        diaries = response.json()
        print(f"  日記数: {len(diaries)}件")
        
        # マッチング済みの日記を確認
        matched_count = sum(1 for diary in diaries if diary.get('is_matched', False))
        print(f"  マッチング済み: {matched_count}件")
        print(f"  未マッチング: {len(diaries) - matched_count}件")
    
    # 2. チャットルームを確認
    print("\n2. 現在のチャットルーム:")
    response = requests.get(f"{base_url}/api/chat-rooms")
    if response.status_code == 200:
        rooms = response.json()
        print(f"  チャットルーム数: {len(rooms)}件")
    
    # 3. マッチング状態をリセット（手動でデータベースを更新する必要があります）
    print("\n3. マッチング状態リセット:")
    print("  注意: この操作は手動でデータベースを更新する必要があります")
    print("  以下のSQLを実行してください:")
    print("  UPDATE diaries SET is_matched = false;")
    print("  DELETE FROM chat_rooms;")
    print("  DELETE FROM chat_messages;")
    
    print("\n=== リセット完了 ===")

if __name__ == "__main__":
    reset_matching() 