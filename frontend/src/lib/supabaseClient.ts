import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 型定義
export interface DiaryEntry {
  id: string
  content: string
  emotion_tag: string
  keywords: any[]
  created_at: string
  expires_at: string
  is_matched: boolean
  anonymous_token: string
}

export interface ChatRoom {
  id: string
  keyword: string
  created_at: string
  expires_at: string
  participant_count: number
  is_active: boolean
}

export interface ChatMessage {
  id: string
  content: string
  anonymous_token: string
  created_at: string
}
