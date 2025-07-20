import { useState, useEffect } from "react";
import { chatApi, ChatRoomResponse, ChatMessageResponse, ChatMessageCreate } from "../lib/api";
import { SupabaseRealtimeChat } from "../lib/supabaseRealtime";

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  isOwn: boolean;
  username: string;
}

function AnimatedKeyword({ keyword }: { keyword: string }) {
  return (
    <div className="relative overflow-hidden w-full mb-6">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-500/20 to-indigo-600/20 blur-3xl rounded-full"></div>
        <div
          className="relative font-bold text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 bg-clip-text text-4xl md:text-5xl text-center tracking-wide"
        >
          <p className="leading-normal animate-pulse drop-shadow-lg">
            {keyword}
          </p>
        </div>
      </div>
    </div>
  );
}

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (time: number) => time.toString().padStart(2, '0');

  return (
    <div className="text-center bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/20">
      <div className="font-semibold text-slate-700 text-lg mb-3 flex items-center justify-center gap-2">
        <span className="text-2xl">⏰</span>
        終了まで {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
      </div>
      <div className="w-full bg-slate-200/50 rounded-full h-3 overflow-hidden shadow-inner">
        <div
          className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 h-3 rounded-full transition-all duration-1000 shadow-sm"
          style={{ width: `${((23 * 3600 + 24 * 60 + 5 - (timeLeft.hours * 3600 + timeLeft.minutes * 60 + timeLeft.seconds)) / (24 * 3600)) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}

function ChatMessage({ message }: { message: Message }) {
  return (
    <div className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'} mb-6 animate-fade-in`}>
      <div className={`max-w-[75%] ${message.isOwn ? 'order-2' : 'order-1'}`}>
        {!message.isOwn && (
          <p className="text-sm text-slate-500 mb-2 px-3 font-medium">{message.username}</p>
        )}
        <div
          className={`px-5 py-3 rounded-3xl shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl hover:scale-[1.02] ${message.isOwn
            ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white border border-purple-400/20'
            : 'bg-white/80 border border-slate-200/50 text-slate-800'
            }`}
        >
          <p className="text-base leading-relaxed">{message.text}</p>
          <p className={`text-xs mt-2 ${message.isOwn ? 'text-purple-100' : 'text-slate-400'}`}>
            {message.timestamp.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  );
}

function ChatInput({ onSendMessage, isSending }: { onSendMessage: (text: string) => void; isSending: boolean }) {
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (inputText.trim() && !isSending) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-md border-t border-white/20 shadow-2xl">
      <div className="p-6 space-y-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="メッセージを入力してください... ✨"
              rows={3}
              className="w-full px-5 py-4 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-base bg-white/80 backdrop-blur-sm shadow-inner placeholder-slate-400 transition-all duration-200 hover:shadow-md"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isSending}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed text-white rounded-2xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 shadow-lg hover:shadow-xl font-semibold text-base min-w-[100px] flex items-center justify-center gap-2"
          >
            <span>{isSending ? '送信中...' : '送信'}</span>
            <span className="text-lg">{isSending ? '⏳' : '✈️'}</span>
          </button>
        </div>
        <div className="text-center text-sm text-slate-500">
          Enterで送信 • Shift+Enterで改行
        </div>
      </div>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="absolute bg-gradient-to-r from-purple-600 to-indigo-600 shadow-2xl z-20 w-full">
      <div className="flex items-center justify-between p-4">
        <button
          onClick={onClick}
          className="h-10 w-10 bg-white/20 backdrop-blur-sm rounded-full transition-all duration-200 hover:bg-white/30 hover:scale-110 active:scale-95 flex items-center justify-center shadow-lg"
          aria-label="戻る"
        >
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-white font-semibold text-lg">チャットルーム</div>
        <div className="w-10"></div>
      </div>
    </div>
  );
}

export default function ChatRoom({ onBack }: { onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoomResponse[]>([]);
  const [currentRoom, setCurrentRoom] = useState<ChatRoomResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [realtimeChat, setRealtimeChat] = useState<SupabaseRealtimeChat | null>(null);

  // チャットルーム一覧を取得
  useEffect(() => {
    const loadChatRooms = async () => {
      try {
        setIsLoading(true);
        const rooms = await chatApi.getRooms();
        setChatRooms(rooms);
        
        // 最初のアクティブなルームを選択
        const activeRoom = rooms.find(room => room.is_active);
        if (activeRoom) {
          setCurrentRoom(activeRoom);
          await loadMessages(activeRoom.id);
          
          // リアルタイムチャットに参加
          const realtime = new SupabaseRealtimeChat(activeRoom.id);
          await realtime.joinRoom((newMessage) => {
            setMessages(prev => [...prev, {
              id: newMessage.id,
              text: newMessage.content,
              timestamp: new Date(newMessage.created_at),
              isOwn: false,
              username: '匿名ユーザー'
            }]);
          });
          setRealtimeChat(realtime);
        }
      } catch (err) {
        console.error('チャットルーム取得エラー:', err);
        setError(err instanceof Error ? err.message : 'チャットルームの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    loadChatRooms();
  }, []);

  // メッセージを取得
  const loadMessages = async (roomId: string) => {
    try {
      const apiMessages = await chatApi.getMessages(roomId);
      
      // APIのメッセージ形式をUI用に変換
      const convertedMessages: Message[] = apiMessages.map(msg => ({
        id: msg.id,
        text: msg.content,
        timestamp: new Date(msg.created_at),
        isOwn: false, // 匿名トークンで判定する必要があります
        username: '匿名ユーザー'
      }));
      
      setMessages(convertedMessages);
    } catch (err) {
      console.error('メッセージ取得エラー:', err);
      setError(err instanceof Error ? err.message : 'メッセージの取得に失敗しました');
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!currentRoom || !realtimeChat) return;
    
    setIsSending(true);
    try {
      // リアルタイムチャットでメッセージを送信
      const response = await realtimeChat.sendMessage(text, 'anonymous_token');
      
      // 新しいメッセージをUIに追加
      const newMessage: Message = {
        id: response.id,
        text: response.content,
        timestamp: new Date(response.created_at),
        isOwn: true,
        username: 'あなた'
      };
      
      setMessages(prev => [...prev, newMessage]);
    } catch (err) {
      console.error('メッセージ送信エラー:', err);
      setError(err instanceof Error ? err.message : 'メッセージの送信に失敗しました');
    } finally {
      setIsSending(false);
    }
  };

  // コンポーネントのクリーンアップ
  useEffect(() => {
    return () => {
      if (realtimeChat) {
        realtimeChat.leaveRoom();
      }
    };
  }, [realtimeChat]);

  return (
    <div className="relative h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -top-20 -right-10 w-60 h-60 bg-pink-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-20 w-80 h-80 bg-indigo-300/20 rounded-full blur-3xl"></div>
      </div>

      <BackButton onClick={onBack} />

      {/* Header with keyword and countdown */}
      <div className="relative pt-24 pb-6 px-6 bg-gradient-to-b from-white/40 to-transparent backdrop-blur-sm">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-lg text-gray-600">チャットルームを読み込み中...</div>
          </div>
        ) : currentRoom ? (
          <>
            <AnimatedKeyword keyword={currentRoom.keyword} />
            <CountdownTimer />
          </>
        ) : (
          <div className="text-center py-8">
            <div className="text-lg text-gray-600">アクティブなチャットルームがありません</div>
          </div>
        )}
      </div>

      {/* Chat messages */}
      <div className="relative flex-1 overflow-y-auto px-6 py-4" style={{ height: 'calc(100vh - 320px)' }}>
        {error && (
          <div className="mb-4 text-center">
            <div className="inline-flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-full text-sm font-medium shadow-lg backdrop-blur-sm">
              <span className="text-lg">⚠️</span>
              {error}
            </div>
          </div>
        )}

        {currentRoom && (
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-3 rounded-full text-sm font-medium shadow-lg backdrop-blur-sm">
              <span className="text-lg">🎯</span>
              「{currentRoom.keyword}」をテーマにしたチャットルームが開始されました
            </div>
          </div>
        )}

        <div className="space-y-2">
          {messages.map(message => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>

        <div className="text-center text-sm text-slate-500 mt-8 bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <span className="text-lg mr-2">💡</span>
          このチャットルームは24時間後に自動終了します
        </div>
      </div>

      {/* Chat input */}
      <div className="absolute bottom-0 left-0 right-0">
        <ChatInput onSendMessage={handleSendMessage} isSending={isSending} />
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}