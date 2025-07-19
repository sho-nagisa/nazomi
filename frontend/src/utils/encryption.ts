// 暗号化ユーティリティ（バックエンドAPIを使用して復号化）

export class EncryptionService {
  private apiBaseUrl: string;

  constructor() {
    this.apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
  }

  /**
   * バックエンドAPIを使用してテキストを復号化
   */
  async decryptText(encryptedText: string): Promise<string> {
    try {
      // 暗号化されているかどうかを判定
      if (!this.isEncrypted(encryptedText)) {
        return encryptedText; // 暗号化されていない場合はそのまま返す
      }

      // バックエンドAPIで復号化を要求
      const response = await fetch(`${this.apiBaseUrl}/api/decrypt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ encrypted_text: encryptedText }),
      });

      if (!response.ok) {
        console.error('復号化APIエラー:', response.statusText);
        return '[復号化エラー]';
      }

      const data = await response.json();
      return data.decrypted_text || encryptedText;
    } catch (error) {
      console.error('復号化エラー:', error);
      return encryptedText;
    }
  }

  /**
   * テキストが暗号化されているかどうかを判定
   */
  private isEncrypted(text: string): boolean {
    // Base64エンコードされた文字列の特徴をチェック
    try {
      // Base64デコードを試行
      const decoded = atob(text);
      
      // 暗号化されたデータは通常、ランダムなバイトデータ
      // 復号化できない場合は暗号化されていると判定
      return decoded.length > 0 && !this.isReadableText(decoded);
    } catch {
      // Base64デコードに失敗した場合は暗号化されていない
      return false;
    }
  }

  /**
   * テキストが読み取り可能かどうかを判定
   */
  private isReadableText(text: string): boolean {
    // 日本語、英語、数字、記号のみを含むかチェック
    const readablePattern = /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\uFF00-\uFFEF\u0020-\u007E\u3000-\u303F]*$/;
    return readablePattern.test(text);
  }
}

export const encryptionService = new EncryptionService(); 