from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.security import encryption_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter(tags=["decrypt"])

class DecryptRequest(BaseModel):
    encrypted_text: str

class DecryptResponse(BaseModel):
    decrypted_text: str

@router.post("/decrypt", response_model=DecryptResponse)
async def decrypt_text(request: DecryptRequest):
    """暗号化されたテキストを復号化"""
    try:
        logger.info(f"復号化リクエスト受信: {request.encrypted_text[:50]}...")
        decrypted_text = encryption_service.decrypt_text(request.encrypted_text)
        logger.info(f"復号化成功: {decrypted_text[:50]}...")
        return DecryptResponse(decrypted_text=decrypted_text)
    except Exception as e:
        logger.error(f"復号化エラー: {e}")
        raise HTTPException(status_code=500, detail=f"復号化に失敗しました: {str(e)}")

@router.get("/decrypt/test")
async def test_decrypt():
    """復号化APIのテスト"""
    try:
        # テスト用の暗号化されたテキスト
        test_encrypted = "Z0FBQUFBQm9INVJpRHdGMINIbUtyT3pGbFN0STVDN2w1ZTZfT0VoRlFlam5tNW9mSGVPb0M4TXpiNHNRZFFYaWpCOXY2cG91VzIDR041d2pzZkt5M0hDOV91S0RCb182VIE9PQ=="
        logger.info(f"テスト復号化開始: {test_encrypted[:50]}...")
        decrypted_text = encryption_service.decrypt_text(test_encrypted)
        logger.info(f"テスト復号化成功: {decrypted_text}")
        return {"success": True, "decrypted_text": decrypted_text}
    except Exception as e:
        logger.error(f"テスト復号化エラー: {e}", exc_info=True)
        return {"success": False, "error": str(e), "traceback": str(e.__class__.__name__)} 