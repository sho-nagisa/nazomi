import { supabase, DiaryEntry, MonthlyDiaryData } from '../lib/supabase'
import { encryptionService } from '../utils/encryption'

export class DiaryService {
  /**
   * 指定された月の日記データを取得
   */
  static async getDiariesByMonth(year: number, month: number): Promise<DiaryEntry[]> {
    try {
      const startDate = new Date(year, month - 1, 1).toISOString()
      const endDate = new Date(year, month, 0).toISOString()

      const { data, error } = await supabase
        .from('diaries')
        .select('*')
        .gte('created_at', startDate)
        .lt('created_at', endDate)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('日記データ取得エラー:', error)
        throw new Error('日記データの取得に失敗しました')
      }

      // 開発環境では暗号化を無効化
      console.log('取得した日記データ:', data);
      
      // 開発環境では暗号化されていないデータとして扱う
      const decryptedData = (data || []).map((entry) => {
        console.log(`日記エントリ ${entry.id}:`, entry.content);
        
        // 開発環境では暗号化されていないと仮定
        if (DiaryService.isEncrypted(entry.content)) {
          console.log(`暗号化されたテキスト ${entry.id}:`, entry.content);
          // 開発環境では暗号化されたデータをそのまま表示
          return {
            ...entry,
            content: '[開発環境: 暗号化データ] ' + entry.content.substring(0, 50) + '...'
          };
        } else {
          console.log(`暗号化されていないテキスト ${entry.id}:`, entry.content);
          return entry;
        }
      });

      return decryptedData
    } catch (error) {
      console.error('日記データ取得エラー:', error)
      throw error
    }
  }

  /**
   * 複数月の日記データを取得
   */
  static async getDiariesByMonths(months: Array<{ year: number; month: number }>): Promise<MonthlyDiaryData[]> {
    try {
      const monthlyData: MonthlyDiaryData[] = []

      for (const { year, month } of months) {
        const entries = await this.getDiariesByMonth(year, month)
        const monthLabel = `${year}年${month}月`
        
        monthlyData.push({
          month: monthLabel,
          entries
        })
      }

      return monthlyData
    } catch (error) {
      console.error('複数月の日記データ取得エラー:', error)
      throw error
    }
  }

  /**
   * 最新の日記データを取得
   */
  static async getRecentDiaries(limit: number = 10): Promise<DiaryEntry[]> {
    try {
      const { data, error } = await supabase
        .from('diaries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('最新日記データ取得エラー:', error)
        throw new Error('最新日記データの取得に失敗しました')
      }

      return data || []
    } catch (error) {
      console.error('最新日記データ取得エラー:', error)
      throw error
    }
  }

  /**
   * 感情タグで日記をフィルタリング
   */
  static async getDiariesByEmotion(emotion: string): Promise<DiaryEntry[]> {
    try {
      const { data, error } = await supabase
        .from('diaries')
        .select('*')
        .eq('emotion_tag', emotion)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('感情別日記データ取得エラー:', error)
        throw new Error('感情別日記データの取得に失敗しました')
      }

      return data || []
    } catch (error) {
      console.error('感情別日記データ取得エラー:', error)
      throw error
    }
  }

  /**
   * 日記を投稿
   */
  static async createDiary(content: string, emotionTag: string): Promise<DiaryEntry> {
    try {
      const { data, error } = await supabase
        .from('diaries')
        .insert([
          {
            content,
            emotion_tag: emotionTag,
            keywords: [], // 後でNLP処理で更新
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30日後
            is_matched: false,
            anonymous_token: this.generateAnonymousToken()
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('日記投稿エラー:', error)
        throw new Error('日記の投稿に失敗しました')
      }

      return data
    } catch (error) {
      console.error('日記投稿エラー:', error)
      throw error
    }
  }

  /**
   * 匿名トークンを生成
   */
  private static generateAnonymousToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  /**
   * テキストが暗号化されているかどうかを判定
   */
  private static isEncrypted(text: string): boolean {
    // 開発環境では暗号化を無効化
    if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
      return false;
    }
    
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
  private static isReadableText(text: string): boolean {
    // 日本語、英語、数字、記号のみを含むかチェック
    const readablePattern = /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\uFF00-\uFFEF\u0020-\u007E\u3000-\u303F]*$/;
    return readablePattern.test(text);
  }
} 