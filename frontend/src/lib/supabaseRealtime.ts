import { supabase } from './supabaseClient'
import { ChatMessage } from './supabaseClient'

// リアルタイムチャット機能
export class SupabaseRealtimeChat {
  private roomId: string
  private onMessageCallback: ((message: ChatMessage) => void) | null = null
  private subscription: any = null

  constructor(roomId: string) {
    this.roomId = roomId
  }

  // チャットルームに参加
  async joinRoom(onMessage: (message: ChatMessage) => void) {
    this.onMessageCallback = onMessage

    // リアルタイムサブスクリプションを開始
    this.subscription = supabase
      .channel(`chat_room_${this.roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${this.roomId}`
        },
        (payload) => {
          if (this.onMessageCallback) {
            this.onMessageCallback(payload.new as ChatMessage)
          }
        }
      )
      .subscribe()

    console.log(`Joined chat room: ${this.roomId}`)
  }

  // メッセージを送信
  async sendMessage(content: string, anonymousToken: string) {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([{
          room_id: this.roomId,
          content,
          anonymous_token: anonymousToken
        }])
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return data
    } catch (error) {
      console.error('Failed to send message:', error)
      throw error
    }
  }

  // チャットルームから退出
  leaveRoom() {
    if (this.subscription) {
      supabase.removeChannel(this.subscription)
      this.subscription = null
    }
    this.onMessageCallback = null
    console.log(`Left chat room: ${this.roomId}`)
  }

  // チャットルームの参加者数を更新
  async updateParticipantCount(count: number) {
    try {
      const { error } = await supabase
        .from('chat_rooms')
        .update({ participant_count: count })
        .eq('id', this.roomId)

      if (error) {
        console.error('Failed to update participant count:', error)
      }
    } catch (error) {
      console.error('Failed to update participant count:', error)
    }
  }
}

// チャットルームの作成
export async function createChatRoom(keyword: string) {
  try {
    const { data, error } = await supabase
      .from('chat_rooms')
      .insert([{
        keyword,
        participant_count: 0,
        is_active: true
      }])
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  } catch (error) {
    console.error('Failed to create chat room:', error)
    throw error
  }
}

// チャットルームの終了
export async function closeChatRoom(roomId: string) {
  try {
    const { error } = await supabase
      .from('chat_rooms')
      .update({ is_active: false })
      .eq('id', roomId)

    if (error) {
      throw new Error(error.message)
    }
  } catch (error) {
    console.error('Failed to close chat room:', error)
    throw error
  }
} 