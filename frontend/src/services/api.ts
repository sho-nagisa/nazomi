const API_BASE_URL = 'http://127.0.0.1:8000';

export interface DiaryCreate {
  content: string;
  emotion_tag: 'happy' | 'sad' | 'angry' | 'excited' | 'calm' | 'anxious' | 'grateful' | 'lonely';
  anonymous_token?: string;
}

export interface Diary {
  id: string;
  content: string;
  emotion_tag: string;
  keywords: any[];
  created_at: string;
  expires_at: string;
  is_matched: boolean;
  anonymous_token: string;
}

export interface ChatRoom {
  id: string;
  empathy_words: any[];
  participants: string[];
  created_at: string;
  expires_at: string;
  is_active: boolean;
  max_participants: number;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  anonymous_token: string;
  content: string;
  created_at: string;
  expires_at: string;
}

export interface Notification {
  id: string;
  anonymous_token: string;
  type: string;
  title: string;
  message: string;
  data: any;
  is_read: boolean;
  created_at: string;
  expires_at: string;
}

export interface EmpathyWord {
  word: string;
  frequency: number;
  importance_score: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Cookieを含める
      ...options,
    };

    // タイムアウト設定（10秒）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    config.signal = controller.signal;

    console.log('API Request:', { url, config });

    try {
      const response = await fetch(url, config);
      
      // タイムアウトクリア
      clearTimeout(timeoutId);
      
      console.log('API Response:', { 
        status: response.status, 
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('API Success Response:', data);
      return data;
    } catch (error) {
      // タイムアウトクリア
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        console.error('API request timeout');
        throw new Error('リクエストがタイムアウトしました。サーバーに接続できません。');
      }
      
      console.error('API request failed:', error);
      throw error;
    }
  }

  // 日記関連API
  async createDiary(diary: DiaryCreate): Promise<Diary> {
    return this.request<Diary>('/api/diary', {
      method: 'POST',
      body: JSON.stringify(diary),
    });
  }

  async getDiary(diaryId: string): Promise<Diary> {
    return this.request<Diary>(`/api/diary/${diaryId}`);
  }

  async getDiaries(): Promise<Diary[]> {
    return this.request<Diary[]>('/api/diaries');
  }

  async getMyDiaries(): Promise<Diary[]> {
    return this.request<Diary[]>('/api/my-diaries');
  }

  // マッチング関連API
  async getEmpathyWords(): Promise<EmpathyWord[]> {
    return this.request<EmpathyWord[]>('/api/empathy-words');
  }

  async runMatching(): Promise<any> {
    return this.request('/api/matching/run', {
      method: 'POST',
    });
  }

  async getMatchingStatus(): Promise<any> {
    return this.request('/api/matching/status');
  }

  // チャット関連API
  async getChatRooms(): Promise<ChatRoom[]> {
    return this.request<ChatRoom[]>('/api/chat-rooms');
  }

  async getChatRoom(roomId: string): Promise<ChatRoom> {
    return this.request<ChatRoom>(`/api/chat-rooms/${roomId}`);
  }

  async getChatMessages(roomId: string): Promise<ChatMessage[]> {
    return this.request<ChatMessage[]>(`/api/chat-rooms/${roomId}/messages`);
  }

  async sendMessage(roomId: string, content: string): Promise<ChatMessage> {
    return this.request<ChatMessage>(`/api/chat-rooms/${roomId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // 通知関連API
  async getNotifications(): Promise<Notification[]> {
    return this.request<Notification[]>('/api/notifications');
  }

  async getUnreadNotificationCount(): Promise<{ count: number }> {
    return this.request<{ count: number }>('/api/notifications/unread-count');
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    return this.request(`/api/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead(): Promise<void> {
    return this.request('/api/notifications/read-all', {
      method: 'PUT',
    });
  }

  // システム関連API
  async getHealth(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health');
  }

  async getStatus(): Promise<any> {
    return this.request('/api/status');
  }
}

export const apiClient = new ApiClient(); 