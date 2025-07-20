import { supabase, DiaryEntry, ChatRoom, ChatMessage } from './supabaseClient'
import { extractEmpathyKeywords } from './empathyKeywords'

// 日記関連のAPI
export const diaryApi = {
  // 日記を投稿
  create: async (data: { content: string; emotion_tag: string; anonymous_token?: string }): Promise<DiaryEntry> => {
    const anonymousToken = data.anonymous_token || getAnonymousToken()
    
    // 共感ワードを抽出
    const empathyResult = extractEmpathyKeywords(data.content)
    
    const insertData = {
      content: data.content,
      emotion_tag: data.emotion_tag,
      keywords: empathyResult.topKeywords, // 上位5個の共感ワードを保存
      anonymous_token: anonymousToken,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30日後
      is_matched: false
    };

    const { data: diary, error } = await supabase
      .from('diaries')
      .insert([insertData])
      .select('id, content, emotion_tag, keywords, created_at, expires_at, is_matched, anonymous_token')
      .single()

    if (error) throw new Error(error.message)
    return diary
  },

  // 自分の日記一覧を取得
  getMyDiaries: async (limit: number = 50): Promise<DiaryEntry[]> => {
    const anonymousToken = getAnonymousToken()
    
    const { data: diaries, error } = await supabase
      .from('diaries')
      .select('*')
      .eq('anonymous_token', anonymousToken)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw new Error(error.message)
    return diaries || []
  },

  // 特定の日記を取得
  getById: async (id: string): Promise<DiaryEntry> => {
    const { data: diary, error } = await supabase
      .from('diaries')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw new Error(error.message)
    return diary
  },

  // 日記のキーワードを取得
  getKeywords: async (id: string): Promise<{ diary_id: string; keywords: string[] }> => {
    const { data: diary, error } = await supabase
      .from('diaries')
      .select('keywords')
      .eq('id', id)
      .single()

    if (error) throw new Error(error.message)
    return {
      diary_id: id,
      keywords: diary.keywords || []
    }
  },
}

// チャット関連のAPI
export const chatApi = {
  // チャットルーム一覧を取得
  getRooms: async (): Promise<ChatRoom[]> => {
    const { data: rooms, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return rooms || []
  },

  // チャットルーム情報を取得
  getRoomInfo: async (roomId: string): Promise<ChatRoom> => {
    const { data: room, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('id', roomId)
      .single()

    if (error) throw new Error(error.message)
    return room
  },

  // チャットメッセージを取得
  getMessages: async (roomId: string): Promise<ChatMessage[]> => {
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })

    if (error) throw new Error(error.message)
    return messages || []
  },

  // チャットメッセージを送信
  sendMessage: async (roomId: string, data: { content: string; anonymous_token?: string }): Promise<ChatMessage> => {
    const { data: message, error } = await supabase
      .from('chat_messages')
      .insert([{
        room_id: roomId,
        content: data.content,
        anonymous_token: data.anonymous_token || getAnonymousToken()
      }])
      .select()
      .single()

    if (error) throw new Error(error.message)
    return message
  },
}

// システム関連のAPI
export const systemApi = {
  // システム状態を取得
  getStatus: async (): Promise<any> => {
    // システム状態テーブルが存在しない場合は基本情報を返す
    return {
      app_name: "匿名日記サービス",
      version: "1.0.0",
      database: "connected",
      features: {
        matching: true,
        chat: true,
        notifications: true,
        encryption: true,
        nlp: true
      }
    }
  },

  // ヘルスチェック
  healthCheck: async (): Promise<any> => {
    try {
      await supabase.from('diaries').select('count').limit(1)
      return { status: "healthy" }
    } catch (error) {
      return { status: "unhealthy", error: error instanceof Error ? error.message : 'Unknown error' }
    }
  },
}

// ユーティリティ関数
function generateAnonymousToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

function getAnonymousToken(): string {
  // Cookieから匿名トークンを取得、なければ生成
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('anonymous_token='))
    ?.split('=')[1]
  
  if (!token) {
    const newToken = generateAnonymousToken()
    document.cookie = `anonymous_token=${newToken}; path=/; max-age=${30 * 24 * 60 * 60}`
    return newToken
  }
  
  return token
} 