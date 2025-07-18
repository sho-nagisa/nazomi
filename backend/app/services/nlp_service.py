import spacy
from typing import List, Dict
from app.core.config import settings
import logging
import asyncio
from concurrent.futures import ThreadPoolExecutor
from sudachipy import tokenizer
from sudachipy import dictionary

logger = logging.getLogger(__name__)

class NLPService:
    def __init__(self):
        try:
            self.nlp = spacy.load(settings.SPACY_MODEL)
        except OSError:
            logger.warning(f"spaCy model '{settings.SPACY_MODEL}' not found. Installing...")
            import subprocess
            subprocess.run(["python", "-m", "spacy", "download", settings.SPACY_MODEL])
            self.nlp = spacy.load(settings.SPACY_MODEL)
        
        # SudachiPyの初期化
        try:
            self.sudachi_tokenizer = dictionary.Dictionary().create()
        except Exception as e:
            logger.warning(f"SudachiPy initialization failed: {e}")
            self.sudachi_tokenizer = None
        
        # ストップワードの定義
        self.stop_words = {
            'の', 'に', 'は', 'を', 'が', 'で', 'と', 'から', 'まで', 'より', 'や', 'か', 'も',
            'です', 'ます', 'でした', 'ました', 'である', 'いる', 'ある', 'なる', 'する',
            'れる', 'られる', 'せる', 'させる', 'たい', 'ない', 'た', 'だ', 'て', 'で',
            'に', 'へ', 'と', 'から', 'まで', 'より', 'や', 'か', 'も', 'など', 'とか',
            'ばかり', 'だけ', 'のみ', 'きり', 'ぐらい', 'ほど', 'くらい', 'ばかり'
        }
    
    async def extract_keywords_async(self, text: str) -> List[Dict]:
        """非同期でキーワードを抽出"""
        loop = asyncio.get_event_loop()
        with ThreadPoolExecutor() as executor:
            keywords = await loop.run_in_executor(executor, self.extract_keywords, text)
        return keywords
    
    def extract_keywords(self, text: str) -> List[Dict]:
        """テキストから共感ワードを抽出"""
        try:
            doc = self.nlp(text)
            keywords = []
            
            for token in doc:
                # 品詞フィルタリング
                if token.pos_ in ['NOUN', 'ADJ', 'VERB'] and not token.is_stop:
                    # ストップワードチェック
                    if token.text not in self.stop_words and len(token.text) > 1:
                        # 重要度スコアを計算
                        importance_score = self._calculate_importance_score(token, doc)
                        
                        keywords.append({
                            'word': token.lemma_,
                            'original': token.text,
                            'pos': token.pos_,
                            'importance_score': importance_score,
                            'frequency': self._count_frequency(token.text, text)
                        })
            
            # 重要度スコアでソート
            keywords.sort(key=lambda x: x['importance_score'], reverse=True)
            
            # 上位10個を返す
            return keywords[:10]
            
        except Exception as e:
            logger.error(f"Keyword extraction error: {e}")
            return []
    
    def _calculate_importance_score(self, token, doc) -> float:
        """重要度スコアを計算"""
        score = 0.0
        
        # 品詞による重み付け
        pos_weights = {
            'NOUN': 1.0,
            'ADJ': 0.8,
            'VERB': 0.6
        }
        score += pos_weights.get(token.pos_, 0.5)
        
        # 文字数による重み付け
        if len(token.text) > 3:
            score += 0.2
        
        # 固有表現の場合の重み付け
        if token.ent_type_:
            score += 0.5
        
        # 文の位置による重み付け
        sentence_position = token.sent.start_char / len(doc.text)
        if sentence_position < 0.3:  # 文の前半
            score += 0.3
        
        return min(score, 2.0)  # 最大2.0に制限
    
    def _count_frequency(self, word: str, text: str) -> int:
        """単語の出現頻度をカウント"""
        return text.count(word)

nlp_service = NLPService() 