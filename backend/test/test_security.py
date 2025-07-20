import pytest
from app.core.security import (
    generate_anonymous_token, validate_anonymous_token,
    filter_inappropriate_content, sanitize_text,
    encryption_service
)

class TestAnonymousToken:
    """匿名トークンのテスト"""
    
    def test_generate_anonymous_token(self):
        """匿名トークン生成のテスト"""
        token1 = generate_anonymous_token()
        token2 = generate_anonymous_token()
        
        # 長さの確認
        assert len(token1) >= 32
        assert len(token2) >= 32
        
        # 一意性の確認
        assert token1 != token2
        
        # 型の確認
        assert isinstance(token1, str)
        assert isinstance(token2, str)
    
    def test_validate_anonymous_token_valid(self):
        """有効な匿名トークンの検証テスト"""
        valid_tokens = [
            "abcdefghijklmnopqrstuvwxyz123456",
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456",
            "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567",
            "test_token_with_underscores_and_hyphens_123"
        ]
        
        for token in valid_tokens:
            assert validate_anonymous_token(token) == True
    
    def test_validate_anonymous_token_invalid(self):
        """無効な匿名トークンの検証テスト"""
        invalid_tokens = [
            "",  # 空文字
            "short",  # 短すぎる
            "invalid token with spaces",  # スペースを含む
            "invalid@token#with$special%chars",  # 特殊文字を含む
            "invalid_token_with_日本語",  # 日本語を含む
            None  # None
        ]
        
        for token in invalid_tokens:
            assert validate_anonymous_token(token) == False

class TestContentFiltering:
    """コンテンツフィルタリングのテスト"""
    
    def test_filter_inappropriate_content_clean(self):
        """適切な内容のフィルタリングテスト"""
        clean_text = "今日はとても良い天気でした。公園で散歩をして、新しい友達と出会いました。"
        filtered_text, has_inappropriate = filter_inappropriate_content(clean_text)
        
        assert filtered_text == clean_text
        assert has_inappropriate == False
    
    def test_filter_inappropriate_content_detected(self):
        """不適切な内容の検出テスト"""
        inappropriate_texts = [
            "今日はとても良い天気でした。死ね。",
            "ばかですね。",
            "あほなことを言わないでください。",
            "くたばれと言われました。",
            "自殺を考えています。"
        ]
        
        for text in inappropriate_texts:
            filtered_text, has_inappropriate = filter_inappropriate_content(text)
            assert has_inappropriate == True
            assert "***" in filtered_text
            assert filtered_text != text
    
    def test_filter_inappropriate_content_multiple(self):
        """複数の不適切なワードの検出テスト"""
        text = "今日はばかで、あほなことをしてしまいました。死ねと言われました。"
        filtered_text, has_inappropriate = filter_inappropriate_content(text)
        
        assert has_inappropriate == True
        assert filtered_text.count("***") >= 3
    
    def test_filter_inappropriate_content_case_sensitive(self):
        """大文字小文字の区別テスト"""
        text = "今日はバカなことをしました。"
        filtered_text, has_inappropriate = filter_inappropriate_content(text)
        
        # 現在の実装では大文字小文字を区別する
        # "バカ"は不適切ワードリストに含まれていないため、検出されない
        assert has_inappropriate == False
        assert "***" not in filtered_text

class TestTextSanitization:
    """テキストサニタイズのテスト"""
    
    def test_sanitize_text_clean(self):
        """適切なテキストのサニタイズテスト"""
        clean_text = "今日はとても良い天気でした。"
        sanitized_text = sanitize_text(clean_text)
        
        assert sanitized_text == clean_text
    
    def test_sanitize_text_html_tags(self):
        """HTMLタグの除去テスト"""
        html_text = "<p>今日はとても良い天気でした。</p><script>alert('test')</script>"
        sanitized_text = sanitize_text(html_text)
        
        assert "<p>" not in sanitized_text
        assert "</p>" not in sanitized_text
        assert "<script>" not in sanitized_text
        assert "alert('test')" not in sanitized_text
        assert "今日はとても良い天気でした。" in sanitized_text
    
    def test_sanitize_text_special_chars(self):
        """特殊文字のエスケープテスト"""
        text_with_special_chars = "今日は<test>で&test&をしました。"
        sanitized_text = sanitize_text(text_with_special_chars)
        
        # HTMLタグが除去され、特殊文字がエスケープされる
        assert "&lt;" not in sanitized_text  # < はHTMLタグとして除去される
        assert "&gt;" not in sanitized_text  # > はHTMLタグとして除去される
        assert "&amp;" in sanitized_text  # & はエスケープされる
        assert "test" in sanitized_text  # テキスト内容は保持される
    
    def test_sanitize_text_quotes(self):
        """引用符のエスケープテスト"""
        text_with_quotes = '今日は"test"と\'test\'をしました。'
        sanitized_text = sanitize_text(text_with_quotes)
        
        assert "&quot;" in sanitized_text  # " がエスケープされている
        assert "&#x27;" in sanitized_text  # ' がエスケープされている
    
    def test_sanitize_text_script_tags(self):
        """スクリプトタグの除去テスト"""
        script_text = "今日は良い天気でした。<script>alert('XSS')</script>公園で散歩しました。"
        sanitized_text = sanitize_text(script_text)
        
        assert "<script>" not in sanitized_text
        assert "alert('XSS')" not in sanitized_text
        assert "今日は良い天気でした。" in sanitized_text
        assert "公園で散歩しました。" in sanitized_text

class TestEncryption:
    """暗号化機能のテスト"""
    
    def test_encrypt_decrypt_text(self):
        """テキストの暗号化・復号化テスト"""
        original_text = "今日はとても良い天気でした。公園で散歩をして、新しい友達と出会いました。"
        
        # 暗号化
        encrypted_text = encryption_service.encrypt_text(original_text)
        
        # 暗号化されたテキストは元のテキストと異なる
        assert encrypted_text != original_text
        assert isinstance(encrypted_text, str)
        assert len(encrypted_text) > 0
        
        # 復号化
        decrypted_text = encryption_service.decrypt_text(encrypted_text)
        
        # 復号化されたテキストは元のテキストと一致
        assert decrypted_text == original_text
    
    def test_encrypt_decrypt_empty_string(self):
        """空文字列の暗号化・復号化テスト"""
        original_text = ""
        
        encrypted_text = encryption_service.encrypt_text(original_text)
        decrypted_text = encryption_service.decrypt_text(encrypted_text)
        
        assert decrypted_text == original_text
    
    def test_encrypt_decrypt_special_chars(self):
        """特殊文字を含むテキストの暗号化・復号化テスト"""
        original_text = "今日は<test>で&test&をしました。'test'と\"test\"も使いました。"
        
        encrypted_text = encryption_service.encrypt_text(original_text)
        decrypted_text = encryption_service.decrypt_text(encrypted_text)
        
        assert decrypted_text == original_text
    
    def test_encrypt_decrypt_long_text(self):
        """長いテキストの暗号化・復号化テスト"""
        original_text = "今日はとても良い天気でした。" * 100  # 長いテキスト
        
        encrypted_text = encryption_service.encrypt_text(original_text)
        decrypted_text = encryption_service.decrypt_text(encrypted_text)
        
        assert decrypted_text == original_text
    
    def test_encrypt_decrypt_unicode(self):
        """Unicode文字を含むテキストの暗号化・復号化テスト"""
        original_text = "今日は🌞良い天気でした。公園で🚶散歩をして、新しい👥友達と出会いました。"
        
        encrypted_text = encryption_service.encrypt_text(original_text)
        decrypted_text = encryption_service.decrypt_text(encrypted_text)
        
        assert decrypted_text == original_text
    
    def test_encrypt_decrypt_consistency(self):
        """暗号化の一貫性テスト"""
        original_text = "テストテキスト"
        
        # 複数回暗号化しても結果が異なる（セキュリティのため）
        encrypted1 = encryption_service.encrypt_text(original_text)
        encrypted2 = encryption_service.encrypt_text(original_text)
        
        assert encrypted1 != encrypted2  # 異なる暗号化結果
        
        # どちらも正しく復号化できる
        decrypted1 = encryption_service.decrypt_text(encrypted1)
        decrypted2 = encryption_service.decrypt_text(encrypted2)
        
        assert decrypted1 == original_text
        assert decrypted2 == original_text

class TestSecurityIntegration:
    """セキュリティ機能の統合テスト"""
    
    def test_full_content_processing_pipeline(self):
        """完全なコンテンツ処理パイプラインのテスト"""
        # 不適切な内容を含むテキスト
        original_text = "今日はとても良い天気でした。<script>alert('XSS')</script>ばかですね。"
        
        # 1. サニタイズ
        sanitized_text = sanitize_text(original_text)
        assert "<script>" not in sanitized_text
        assert "alert('XSS')" not in sanitized_text
        
        # 2. フィルタリング
        filtered_text, has_inappropriate = filter_inappropriate_content(sanitized_text)
        assert has_inappropriate == True
        assert "***" in filtered_text
        
        # 3. 暗号化
        encrypted_text = encryption_service.encrypt_text(filtered_text)
        assert encrypted_text != filtered_text
        
        # 4. 復号化
        decrypted_text = encryption_service.decrypt_text(encrypted_text)
        assert decrypted_text == filtered_text
    
    def test_anonymous_token_with_content_processing(self):
        """匿名トークンとコンテンツ処理の統合テスト"""
        # 匿名トークンを生成
        token = generate_anonymous_token()
        assert validate_anonymous_token(token) == True
        
        # トークンを使用してコンテンツを処理
        content = f"トークン{token}を使用してテストを実行しました。"
        
        # サニタイズ
        sanitized_content = sanitize_text(content)
        assert token in sanitized_content  # トークンは保持される
        
        # 暗号化
        encrypted_content = encryption_service.encrypt_text(sanitized_content)
        decrypted_content = encryption_service.decrypt_text(encrypted_content)
        assert decrypted_content == sanitized_content 