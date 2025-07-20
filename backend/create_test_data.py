#!/usr/bin/env python3
"""
マッチング機能テスト用の日記データを作成するスクリプト
"""

import asyncio
import requests
import json
from datetime import datetime, timedelta
import random

# テスト用の日記データ
test_diaries = [
    {
        "content": "今日は新しいプロジェクトが始まりました。みんなと協力して頑張りたいと思います。",
        "emotion_tag": "happy"
    },
    {
        "content": "昨日の疲れが残っていましたが、温かいコーヒーで元気になりました。",
        "emotion_tag": "neutral"
    },
    {
        "content": "仕事が忙しくて疲れましたが、達成感もありました。",
        "emotion_tag": "neutral"
    },
    {
        "content": "今年一年ありがとうございました。来年もよろしくお願いします。",
        "emotion_tag": "happy"
    },
    {
        "content": "年末の大掃除をしました。部屋がすっきりして気持ちいいです。",
        "emotion_tag": "happy"
    },
    {
        "content": "友達と会えて楽しかったです。久しぶりに笑いました。",
        "emotion_tag": "happy"
    },
    {
        "content": "月末でバタバタしていました。少し疲れ気味です。",
        "emotion_tag": "sad"
    },
    {
        "content": "紅葉がきれいでした。散歩していて心が癒されました。",
        "emotion_tag": "happy"
    },
    {
        "content": "ハロウィンでした。お菓子をたくさん食べて幸せです。",
        "emotion_tag": "happy"
    },
    {
        "content": "秋の空気が心地よかったです。",
        "emotion_tag": "neutral"
    },
    {
        "content": "新しい本を読み始めました。とても面白そうです。",
        "emotion_tag": "excited"
    },
    {
        "content": "今日は天気が良くて、気持ちが晴れました。",
        "emotion_tag": "happy"
    },
    {
        "content": "仕事でミスをしてしまいました。申し訳ない気持ちです。",
        "emotion_tag": "sad"
    },
    {
        "content": "家族と一緒に食事をしました。とても楽しい時間でした。",
        "emotion_tag": "grateful"
    },
    {
        "content": "明日のプレゼンテーションが心配です。",
        "emotion_tag": "anxious"
    }
]

async def create_test_diaries():
    """テスト用の日記データを作成"""
    base_url = "http://127.0.0.1:8000"
    
    print("テスト用の日記データを作成中...")
    
    for i, diary_data in enumerate(test_diaries, 1):
        try:
            # 日記を投稿
            response = requests.post(
                f"{base_url}/api/diary",
                json=diary_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ 日記 {i} 作成成功: {diary_data['emotion_tag']} - {diary_data['content'][:30]}...")
            else:
                print(f"❌ 日記 {i} 作成失敗: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"❌ 日記 {i} 作成エラー: {e}")
    
    print("\nテストデータ作成完了！")
    
    # 作成された日記を確認
    try:
        response = requests.get(f"{base_url}/api/diaries")
        if response.status_code == 200:
            diaries = response.json()
            print(f"\n📊 現在の日記数: {len(diaries)}件")
            
            # 感情別の集計
            emotion_counts = {}
            for diary in diaries:
                emotion = diary.get('emotion_tag', 'unknown')
                emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
            
            print("📈 感情別集計:")
            for emotion, count in emotion_counts.items():
                print(f"  {emotion}: {count}件")
                
    except Exception as e:
        print(f"❌ 日記一覧取得エラー: {e}")

if __name__ == "__main__":
    asyncio.run(create_test_diaries()) 