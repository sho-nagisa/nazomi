from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from app.db.models import Diary, ChatRoom, Notification
from app.schemas.diary import ChatRoomCreate, MatchingResult
from app.core.security import encryption_service
from app.services.nlp_service import nlp_service
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple
import logging
import asyncio
from collections import defaultdict

logger = logging.getLogger(__name__)

class MatchingService:
    def __init__(self):
        self.similarity_threshold = 0.1  # 類似度閾値（10%にさらに緩和）
        self.max_participants = 5  # 最大参加者数
        self.time_window_hours = 24  # 時間帯フィルタリング（±24時間に緩和）
    
    async def run_matching(self, db: Session) -> List[MatchingResult]:
        """マッチング処理を実行"""
        try:
            # 未マッチングの日記を取得
            unmatched_diaries = self._get_unmatched_diaries(db)
            logger.info(f"未マッチング日記数: {len(unmatched_diaries)}")
            
            if len(unmatched_diaries) < 2:
                logger.info("マッチング対象の日記が不足しています")
                return []
            
            # 時間帯でグループ化
            time_groups = self._group_by_time_window(unmatched_diaries)
            logger.info(f"時間帯グループ数: {len(time_groups)}")
            
            matching_results = []
            
            for i, time_group in enumerate(time_groups):
                logger.info(f"時間帯グループ {i+1}: {len(time_group)}件")
                if len(time_group) < 2:
                    continue
                
                # 共感ワードの類似度を計算
                empathy_groups = self._group_by_empathy_similarity(time_group)
                logger.info(f"  共感グループ数: {len(empathy_groups)}")
                
                for j, empathy_group in enumerate(empathy_groups):
                    logger.info(f"  共感グループ {j+1}: {len(empathy_group)}件")
                    if len(empathy_group) >= 2 and len(empathy_group) <= self.max_participants:
                        # チャットルームを作成
                        room = await self._create_chat_room(db, empathy_group)
                        if room:
                            matching_results.append(MatchingResult(
                                room_id=room.id,
                                empathy_words=room.empathy_words,
                                participants_count=len(room.participants),
                                created_at=room.created_at
                            ))
                            
                            # 参加者に通知を送信
                            await self._send_matching_notifications(db, room)
            
            return matching_results
            
        except Exception as e:
            logger.error(f"マッチング処理エラー: {e}")
            return []
    
    def _get_unmatched_diaries(self, db: Session) -> List[Diary]:
        """未マッチングの日記を取得"""
        return db.query(Diary).filter(
            and_(
                Diary.is_matched == False,
                Diary.keywords.isnot(None),
                Diary.expires_at > datetime.utcnow()
            )
        ).all()
    
    def _group_by_time_window(self, diaries: List[Diary]) -> List[List[Diary]]:
        """時間帯でグループ化（±2時間）"""
        time_groups = []
        processed = set()
        
        for diary in diaries:
            if diary.id in processed:
                continue
            
            # 時間帯グループを作成
            time_group = [diary]
            processed.add(diary.id)
            
            diary_time = diary.created_at
            time_start = diary_time - timedelta(hours=self.time_window_hours)
            time_end = diary_time + timedelta(hours=self.time_window_hours)
            
            for other_diary in diaries:
                if other_diary.id in processed:
                    continue
                
                if time_start <= other_diary.created_at <= time_end:
                    time_group.append(other_diary)
                    processed.add(other_diary.id)
            
            if len(time_group) >= 2:
                time_groups.append(time_group)
        
        return time_groups
    
    def _group_by_empathy_similarity(self, diaries: List[Diary]) -> List[List[Diary]]:
        """共感ワードの類似度でグループ化"""
        empathy_groups = []
        processed = set()
        
        for diary in diaries:
            if diary.id in processed:
                continue
            
            # 類似度グループを作成
            empathy_group = [diary]
            processed.add(diary.id)
            
            diary_keywords = self._extract_keyword_set(diary.keywords)
            logger.info(f"基準日記 {diary.id}: {list(diary_keywords)}")
            
            for other_diary in diaries:
                if other_diary.id in processed:
                    continue
                
                other_keywords = self._extract_keyword_set(other_diary.keywords)
                similarity = self._calculate_similarity(diary_keywords, other_keywords)
                
                logger.info(f"  比較対象 {other_diary.id}: {list(other_keywords)} (類似度: {similarity:.2f})")
                
                if similarity >= self.similarity_threshold:
                    empathy_group.append(other_diary)
                    processed.add(other_diary.id)
                    logger.info(f"    ✅ マッチング成立 (類似度: {similarity:.2f})")
                else:
                    logger.info(f"    ❌ マッチング不成立 (類似度: {similarity:.2f} < {self.similarity_threshold})")
            
            if len(empathy_group) >= 2:
                empathy_groups.append(empathy_group)
                logger.info(f"  グループ作成: {len(empathy_group)}件")
        
        return empathy_groups
    
    def _extract_keyword_set(self, keywords: List[Dict[str, Any]]) -> set:
        """キーワードセットを抽出"""
        if not keywords:
            return set()
        
        keyword_set = set()
        for keyword in keywords:
            if isinstance(keyword, dict) and 'word' in keyword:
                keyword_set.add(keyword['word'].lower())
        
        return keyword_set
    
    def _calculate_similarity(self, keywords1: set, keywords2: set) -> float:
        """Jaccard類似度を計算"""
        if not keywords1 or not keywords2:
            return 0.0
        
        intersection = len(keywords1.intersection(keywords2))
        union = len(keywords1.union(keywords2))
        similarity = intersection / union if union > 0 else 0.0
        
        logger.debug(f"類似度計算: 共通={intersection}, 合計={union}, 類似度={similarity:.2f}")
        
        return similarity
    
    async def _create_chat_room(self, db: Session, diaries: List[Diary]) -> ChatRoom:
        """チャットルームを作成"""
        try:
            # 共通の共感ワードを抽出
            common_keywords = self._extract_common_keywords(diaries)
            
            # 参加者の匿名トークンを収集
            participants = [diary.anonymous_token for diary in diaries if diary.anonymous_token]
            
            # チャットルームを作成
            room = ChatRoom(
                empathy_words=common_keywords,
                participants=participants,
                max_participants=self.max_participants
            )
            
            db.add(room)
            db.commit()
            db.refresh(room)
            
            # 日記をマッチング済みに更新
            for diary in diaries:
                diary.is_matched = True
            
            db.commit()
            
            logger.info(f"チャットルーム作成: {room.id}, 参加者数: {len(participants)}")
            return room
            
        except Exception as e:
            logger.error(f"チャットルーム作成エラー: {e}")
            db.rollback()
            return None
    
    def _extract_common_keywords(self, diaries: List[Diary]) -> List[Dict[str, Any]]:
        """共通の共感ワードを抽出"""
        keyword_freq = defaultdict(int)
        keyword_scores = defaultdict(list)
        
        for diary in diaries:
            if not diary.keywords:
                continue
            
            for keyword in diary.keywords:
                if isinstance(keyword, dict) and 'word' in keyword:
                    word = keyword['word'].lower()
                    keyword_freq[word] += 1
                    keyword_scores[word].append(keyword.get('importance_score', 0.0))
        
        # 共通キーワードを抽出（2つ以上の日記に出現）
        common_keywords = []
        for word, freq in keyword_freq.items():
            if freq >= 2:
                avg_score = sum(keyword_scores[word]) / len(keyword_scores[word])
                common_keywords.append({
                    'word': word,
                    'frequency': freq,
                    'importance_score': avg_score
                })
        
        # 重要度スコアでソート
        common_keywords.sort(key=lambda x: x['importance_score'], reverse=True)
        
        return common_keywords[:10]  # 上位10個を返す
    
    async def _send_matching_notifications(self, db: Session, room: ChatRoom):
        """マッチング成功通知を送信"""
        try:
            for token in room.participants:
                notification = Notification(
                    anonymous_token=token,
                    type="matching_success",
                    title="共感ルームが開かれました",
                    message=f"あなたの日記と共感できる仲間が見つかりました。{len(room.empathy_words)}個の共通ワードでマッチングしました。",
                    data={
                        "room_id": room.id,
                        "empathy_words": room.empathy_words,
                        "participants_count": len(room.participants)
                    }
                )
                db.add(notification)
            
            db.commit()
            logger.info(f"マッチング通知送信: {len(room.participants)}件")
            
        except Exception as e:
            logger.error(f"通知送信エラー: {e}")
            db.rollback()
    
    def get_todays_empathy_words(self, db: Session) -> List[Dict[str, Any]]:
        """今日の共感ワード一覧を取得"""
        try:
            today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            today_end = today_start + timedelta(days=1)
            
            # 今日作成された日記のキーワードを集計
            diaries = db.query(Diary).filter(
                and_(
                    Diary.created_at >= today_start,
                    Diary.created_at < today_end,
                    Diary.keywords.isnot(None)
                )
            ).all()
            
            word_freq = defaultdict(int)
            word_scores = defaultdict(list)
            
            for diary in diaries:
                if not diary.keywords:
                    continue
                
                for keyword in diary.keywords:
                    if isinstance(keyword, dict) and 'word' in keyword:
                        word = keyword['word'].lower()
                        word_freq[word] += 1
                        word_scores[word].append(keyword.get('importance_score', 0.0))
            
            # 頻度と重要度でソート
            empathy_words = []
            for word, freq in word_freq.items():
                avg_score = sum(word_scores[word]) / len(word_scores[word])
                empathy_words.append({
                    'word': word,
                    'frequency': freq,
                    'importance_score': avg_score
                })
            
            empathy_words.sort(key=lambda x: (x['frequency'], x['importance_score']), reverse=True)
            return empathy_words[:20]  # 上位20個を返す
            
        except Exception as e:
            logger.error(f"共感ワード取得エラー: {e}")
            return []

matching_service = MatchingService() 