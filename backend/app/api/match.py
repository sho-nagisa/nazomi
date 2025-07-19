from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
from supabase import create_client
import os
from dotenv import load_dotenv
import json

router = APIRouter()

load_dotenv(".env")
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

# グループマッチ処理
@router.post("/api/chat-rooms")
async def match_and_create_rooms():
    try:
        now = datetime.utcnow()
        from_time = now - timedelta(hours=2)
        to_time = now + timedelta(hours=2)

        # 未マッチの日記取得（例：24時間以内、感情別）
        response = supabase.table("diary").select("*").execute()
        diaries = [d for d in response.data if "matched" not in d]

        # 感情ごとに分類
        emotion_groups = {}
        for diary in diaries:
            emotion = diary["emotion"]
            emotion_groups.setdefault(emotion, []).append(diary)

        matched_rooms = []

        for emotion, group in emotion_groups.items():
            # ±2時間以内に投稿された日記でフィルタ
            group = [
                d for d in group
                if from_time <= datetime.fromisoformat(d["create_at"]) <= to_time
            ]

            # 類似度計算とグループ化
            for i in range(len(group)):
                user1 = group[i]
                if "matched" in user1:
                    continue

                matches = [user1]
                kw1_resp = supabase.table("parsed_keyword").select("word").eq("diaryid", user1["id"]).execute()
                kw1 = set([k["word"] for k in kw1_resp.data])

                for j in range(i + 1, len(group)):
                    user2 = group[j]
                    if "matched" in user2:
                        continue

                    kw2_resp = supabase.table("parsed_keyword").select("word").eq("diaryid", user2["id"]).execute()
                    kw2 = set([k["word"] for k in kw2_resp.data])

                    # 類似度（Jaccard）
                    intersection = len(kw1 & kw2)
                    union = len(kw1 | kw2)
                    similarity = intersection / union if union != 0 else 0

                    if similarity >= 0.7:
                        matches.append(user2)

                    if len(matches) >= 5:
                        break

                if len(matches) >= 2:
                    # チャットルーム作成
                    participants = [m["userid"] for m in matches]
                    common_words = list(kw1)
                    expires_at = (datetime.utcnow() + timedelta(hours=24)).isoformat()

                    supabase.table("chat_rooms").insert({
                        "participants": json.dumps(participants),
                        "empathy_words": json.dumps(common_words),
                        "expires_at": expires_at
                    }).execute()

                    # matchedフラグを追加（ここでは更新例）
                    for m in matches:
                        supabase.table("diary").update({"matched": True}).eq("id", m["id"]).execute()

                    matched_rooms.append(participants)

        return {"matched_groups": matched_rooms}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/empathy-words")
async def get_empathy_words():
    try:
        today = datetime.utcnow().date().isoformat()
        response = supabase.table("parsed_keyword").select("*").execute()
        words = [r["word"] for r in response.data if r["create_at"].startswith(today)]
        return {"empathy_words": list(set(words))}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/chat-rooms")
async def get_chat_rooms():
    try:
        now = datetime.utcnow().isoformat()
        response = supabase.table("chat_rooms").select("*").execute()
        rooms = [r for r in response.data if r["expires_at"] > now]
        return {"rooms": rooms}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
