from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends, Request, Cookie
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings
from cryptography.fernet import Fernet
import base64
import secrets
import re

# パスワードハッシュ化
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT認証
security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """パスワードの検証"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """パスワードのハッシュ化"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """アクセストークンの作成"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """トークンの検証"""
    try:
        payload = jwt.decode(credentials.credentials, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user_id
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def generate_anonymous_token() -> str:
    """匿名トークンを生成"""
    return secrets.token_urlsafe(32)

def get_anonymous_token(request: Request, anonymous_token: Optional[str] = Cookie(None)) -> str:
    """匿名トークンを取得または生成"""
    import logging
    logger = logging.getLogger(__name__)
    
    # Cookieから取得を試行（手動でCookieを読み取り）
    cookie_header = request.headers.get("cookie", "")
    logger.info(f"Cookie header: {cookie_header}")
    
    # Cookieヘッダーからanonymous_tokenを抽出
    for cookie in cookie_header.split(";"):
        cookie = cookie.strip()
        if cookie.startswith("anonymous_token="):
            token = cookie[len("anonymous_token="):]
            logger.info(f"Extracted token from cookie: {token}")
            
            # トークンの形式を検証（より緩い条件）
            if len(token) >= 16 and re.match(r'^[A-Za-z0-9_-]+$', token):
                logger.info(f"Using existing token: {token}")
                return token
            else:
                logger.info(f"Token format invalid, generating new token")
                break
    
    # Cookie依存関係からも試行
    if anonymous_token and isinstance(anonymous_token, str):
        logger.info(f"Received anonymous_token from dependency: {anonymous_token}")
        # トークンの形式を検証（より緩い条件）
        if len(anonymous_token) >= 16 and re.match(r'^[A-Za-z0-9_-]+$', anonymous_token):
            logger.info(f"Using existing token: {anonymous_token}")
            return anonymous_token
        else:
            logger.info(f"Token format invalid, generating new token")
    
    # 新しいトークンを生成
    new_token = generate_anonymous_token()
    logger.info(f"Generated new token: {new_token}")
    
    # レスポンスにCookieを設定するため、request.stateに保存
    request.state.new_anonymous_token = new_token
    
    return new_token

def validate_anonymous_token(token: str) -> bool:
    """匿名トークンの形式を検証"""
    if not token:
        return False
    
    # 32文字以上の英数字、ハイフン、アンダースコアのみ
    return bool(re.match(r'^[A-Za-z0-9_-]{32,}$', token))

def filter_inappropriate_content(text: str) -> tuple[str, bool]:
    """不適切な内容をフィルタリング"""
    # 不適切なワードリスト（実際の運用では外部ファイルやデータベースから読み込み）
    inappropriate_words = [
        "死ね", "殺す", "自殺", "死", "消えろ", "きえろ",
        "ばか", "あほ", "まぬけ", "のろま",
        "くたばれ", "くたばる", "しね", "ころす",
        "じさつ", "しぬ", "きえる", "ばか", "あほ"
    ]
    
    filtered_text = text
    has_inappropriate = False
    
    for word in inappropriate_words:
        if word in filtered_text:
            # 不適切なワードを***で置換
            filtered_text = filtered_text.replace(word, "***")
            has_inappropriate = True
    
    return filtered_text, has_inappropriate

def sanitize_text(text: str) -> str:
    """テキストをサニタイズ"""
    # HTMLタグを除去
    import re
    text = re.sub(r'<[^>]+>', '', text)
    
    # スクリプトタグを除去
    text = re.sub(r'<script[^>]*>.*?</script>', '', text, flags=re.IGNORECASE | re.DOTALL)
    
    # 特殊文字をエスケープ
    text = text.replace('&', '&amp;')
    text = text.replace('<', '&lt;')
    text = text.replace('>', '&gt;')
    text = text.replace('"', '&quot;')
    text = text.replace("'", '&#x27;')
    
    return text

class EncryptionService:
    def __init__(self):
        # 開発環境では暗号化を無効化
        self.development_mode = settings.DEBUG or os.getenv('ENVIRONMENT') == 'development'
        
        if self.development_mode:
            print("Development mode: Encryption disabled")
            self.cipher = None
        else:
            # 本番環境では暗号化を有効化
            if not settings.ENCRYPTION_KEY:
                # 本番環境では環境変数から取得
                raise ValueError("ENCRYPTION_KEY must be set in production")
            else:
                try:
                    # 既存のキーをbase64デコードして使用
                    key = base64.urlsafe_b64decode(settings.ENCRYPTION_KEY + '=' * (-len(settings.ENCRYPTION_KEY) % 4))
                    if len(key) != 32:
                        raise ValueError("ENCRYPTION_KEY must be 32 bytes")
                    self.cipher = Fernet(key)
                except Exception as e:
                    raise ValueError(f"Invalid ENCRYPTION_KEY format: {e}")
    
    def encrypt_text(self, text: str) -> str:
        """テキストを暗号化"""
        if self.development_mode:
            # 開発環境では暗号化せずにそのまま返す
            return text
        else:
            encrypted_data = self.cipher.encrypt(text.encode())
            return base64.urlsafe_b64encode(encrypted_data).decode()
    
    def decrypt_text(self, encrypted_text: str) -> str:
        """テキストを復号化"""
        if self.development_mode:
            # 開発環境では復号化せずにそのまま返す
            return encrypted_text
        else:
            encrypted_data = base64.urlsafe_b64decode(encrypted_text.encode())
            decrypted_data = self.cipher.decrypt(encrypted_data)
            return decrypted_data.decode()
    


encryption_service = EncryptionService() 