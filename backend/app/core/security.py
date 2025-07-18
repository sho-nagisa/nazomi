from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings
from cryptography.fernet import Fernet
import base64

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

class EncryptionService:
    def __init__(self):
        # ENCRYPTION_KEYが設定されていない場合は新しく生成
        if not settings.ENCRYPTION_KEY:
            # 新しい32バイトのキーを生成
            key = Fernet.generate_key()
            print(f"Warning: ENCRYPTION_KEY not set. Generated new key: {key.decode()}")
        else:
            try:
                # 既存のキーをbase64デコードして使用
                key = base64.urlsafe_b64decode(settings.ENCRYPTION_KEY + '=' * (-len(settings.ENCRYPTION_KEY) % 4))
                if len(key) != 32:
                    # キーが32バイトでない場合は新しく生成
                    key = Fernet.generate_key()
                    print(f"Warning: ENCRYPTION_KEY is not 32 bytes. Generated new key: {key.decode()}")
            except Exception:
                # キーの形式が不正な場合は新しく生成
                key = Fernet.generate_key()
                print(f"Warning: Invalid ENCRYPTION_KEY format. Generated new key: {key.decode()}")
        
        self.cipher = Fernet(key)
    
    def encrypt_text(self, text: str) -> str:
        """テキストを暗号化"""
        encrypted_data = self.cipher.encrypt(text.encode())
        return base64.urlsafe_b64encode(encrypted_data).decode()
    
    def decrypt_text(self, encrypted_text: str) -> str:
        """テキストを復号化"""
        encrypted_data = base64.urlsafe_b64decode(encrypted_text.encode())
        decrypted_data = self.cipher.decrypt(encrypted_data)
        return decrypted_data.decode()

encryption_service = EncryptionService() 