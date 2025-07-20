// Supabase APIクライアントを使用
export { diaryApi, chatApi, systemApi } from './supabaseApi'
export type { DiaryEntry, ChatRoom, ChatMessage } from './supabaseClient'

// 型定義（後方互換性のため）
export interface DiaryCreate {
  content: string;
  emotion_tag?: string;
  anonymous_token?: string;
}

export interface DiaryResponse {
  id: string;
  content: string;
  emotion_tag: string;
  keywords: any[];
  created_at: string;
  expires_at: string;
  is_matched: boolean;
  anonymous_token: string;
}

export interface ChatRoomResponse {
  id: string;
  keyword: string;
  created_at: string;
  expires_at: string;
  participant_count: number;
  is_active: boolean;
}

export interface ChatMessageCreate {
  content: string;
  anonymous_token?: string;
}

export interface ChatMessageResponse {
  id: string;
  content: string;
  anonymous_token: string;
  created_at: string;
} 