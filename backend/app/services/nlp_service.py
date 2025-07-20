import spacy
import json
from typing import List, Dict, Any
import re

class NLPService:
    def __init__(self):
        # spaCyモデルをロード（日本語モデルが利用可能な場合）
        try:
            self.nlp = spacy.load("ja_core_news_sm")
        except OSError:
            # 日本語モデルが利用できない場合は英語モデルを使用
            try:
                self.nlp = spacy.load("en_core_web_sm")
            except OSError:
                # モデルがインストールされていない場合はダミー実装
                self.nlp = None
    
    def extract_keywords(self, text: str) -> List[str]:
        """テキストからキーワードを抽出"""
        if not self.nlp or not text:
            return []
        
        try:
            doc = self.nlp(text)
            # 名詞、形容詞、動詞をキーワードとして抽出
            keywords = []
            for token in doc:
                if token.pos_ in ['NOUN', 'ADJ', 'VERB'] and not token.is_stop:
                    keywords.append(token.text.lower())
            
            # 重複を除去して上位10個を返す
            return list(set(keywords))[:10]
        except Exception:
            # エラーが発生した場合は単純な単語分割
            words = re.findall(r'\w+', text.lower())
            return list(set(words))[:10]
    
    async def extract_keywords_async(self, text: str) -> List[Dict[str, Any]]:
        """非同期でテキストからキーワードを抽出（辞書形式で返す）"""
        keywords = self.extract_keywords(text)
        return [{"word": kw, "frequency": 1, "importance_score": 0.5} for kw in keywords]
    
    def analyze_emotion(self, text: str) -> Dict[str, Any]:
        """テキストの感情分析"""
        if not text:
            return {"emotion": "neutral", "confidence": 0.0}
        
        # 簡単な感情分析（実際のプロジェクトではより高度な分析を使用）
        positive_words = ["楽しい", "嬉しい", "幸せ", "良い", "素晴らしい", "最高", "愛", "感謝"]
        negative_words = ["悲しい", "辛い", "苦しい", "嫌", "悪い", "最悪", "怒り", "不安"]
        
        text_lower = text.lower()
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        if positive_count > negative_count:
            emotion = "positive"
            confidence = min(0.9, positive_count / (positive_count + negative_count + 1))
        elif negative_count > positive_count:
            emotion = "negative"
            confidence = min(0.9, negative_count / (positive_count + negative_count + 1))
        else:
            emotion = "neutral"
            confidence = 0.5
        
        return {
            "emotion": emotion,
            "confidence": confidence,
            "positive_score": positive_count,
            "negative_score": negative_count
        }
    
    def find_empathy_words(self, text: str) -> List[str]:
        """共感ワードを抽出"""
        empathy_words = [
            "そうですね", "確かに", "分かります", "理解できます", "同感です",
            "大変でしたね", "お疲れ様です", "頑張ってください", "応援しています"
        ]
        
        found_words = []
        for word in empathy_words:
            if word in text:
                found_words.append(word)
        
        return found_words

# グローバルインスタンス
nlp_service = NLPService() 