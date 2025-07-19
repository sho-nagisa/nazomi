import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 日記テーブルの型定義
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

// 月別日記データの型定義
export interface MonthlyDiaryData {
  month: string
  entries: DiaryEntry[]
} 