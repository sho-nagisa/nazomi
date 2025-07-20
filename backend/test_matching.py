#!/usr/bin/env python3
"""
マッチング機能のテストスクリプト
"""

import requests
import json

def test_matching():
    """マッチング機能をテスト"""
    base_url = "http://127.0.0.1:8000"
    
    print("=== マッチング機能テスト ===")
    
    # 1. 現在の日記データを確認
    print("\n1. 現在の日記データ:")
    response = requests.get(f"{base_url}/api/diaries")
    if response.status_code == 200:
        diaries = response.json()
        print(f"  日記数: {len(diaries)}件")
        
        # キーワードの分析
        all_keywords = []
        for diary in diaries:
            keywords = diary.get('keywords', [])
            for kw in keywords:
                if isinstance(kw, dict) and 'word' in kw:
                    all_keywords.append(kw['word'])
        
        print(f"  総キーワード数: {len(all_keywords)}")
        print(f"  ユニークキーワード数: {len(set(all_keywords))}")
        
        # 共通キーワードを探す
        keyword_counts = {}
        for keyword in all_keywords:
            keyword_counts[keyword] = keyword_counts.get(keyword, 0) + 1
        
        common_keywords = {kw: count for kw, count in keyword_counts.items() if count > 1}
        print(f"  共通キーワード: {common_keywords}")
    
    # 2. マッチング処理を実行
    print("\n2. マッチング処理実行:")
    response = requests.post(f"{base_url}/api/matching/run")
    if response.status_code == 200:
        result = response.json()
        print(f"  結果: {result['result']['message']}")
        
        if result['result']['results']:
            print("  作成されたルーム:")
            for room in result['result']['results']:
                print(f"    - ルームID: {room['room_id']}")
                print(f"      参加者数: {room['participants_count']}")
                print(f"      共感ワード: {room['empathy_words']}")
        else:
            print("  作成されたルーム: なし")
    
    # 3. 共感ワードを確認
    print("\n3. 今日の共感ワード:")
    response = requests.get(f"{base_url}/api/empathy-words")
    if response.status_code == 200:
        empathy_words = response.json()
        print(f"  共感ワード数: {len(empathy_words)}")
        for word in empathy_words[:5]:  # 上位5件を表示
            print(f"    - {word['word']} (頻度: {word['frequency']}, 重要度: {word['importance_score']:.2f})")
    
    print("\n=== テスト完了 ===")

if __name__ == "__main__":
    test_matching() 