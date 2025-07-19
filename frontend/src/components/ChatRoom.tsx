import React, { useState, useEffect, useRef } from "react";
import svgPaths from "../../imports/svg-mn7zcpghp2";
import { apiClient, ChatMessage as ApiChatMessage, ChatRoom as ApiChatRoom } from '../services/api';

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  isOwn: boolean;
  username: string;
}

function AnimatedKeyword({ keyword }: { keyword: string }) {
  return (
    <div className="relative overflow-hidden w-full">
      <div
        className="[text-shadow:rgba(0,0,0,0.25)_0px_4px_4px] font-['SF_Pro:Heavy',_'Noto_Sans_JP:Bold',_sans-serif] font-[860] text-transparent bg-gradient-to-r from-[#6366F1] via-[#EC4899] to-[#8B5CF6] bg-clip-text text-[50px] text-center tracking-[2.5px] animate-pulse"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[normal] animate-bounce">
          {keyword}
        </p>
      </div>
    </div>
  );
}

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 24,
    seconds: 5
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
    <div className="text-center">
      <div
        className="font-['SF_Pro:Heavy',_'Noto_Sans_JP:Bold',_sans-serif] font-[860] text-[#374151] text-[16px] tracking-[0.8px]"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing leading-[normal]">
          終了まで {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
        </p>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
        <div 
          className="bg-gradient-to-r from-[#EC4899] to-[#F59E0B] h-2 rounded-full transition-all duration-1000"
          style={{ width: `${((23*3600 + 24*60 + 5 - (timeLeft.hours*3600 + timeLeft.minutes*60 + timeLeft.seconds)) / (24*3600)) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}

function ChatMessage({ message }: { message: Message }) {
  return (
    <div className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] ${message.isOwn ? 'order-2' : 'order-1'}`}>
        {!message.isOwn && (
          <p className="text-xs text-gray-500 mb-1 px-2">{message.username}</p>
        )}
        <div
          className={`px-4 py-2 rounded-2xl ${
            message.isOwn
              ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white'
              : 'bg-white border border-gray-200 text-gray-800'
          } shadow-sm`}
        >
          <p className="text-sm">{message.text}</p>
          <p className={`text-xs mt-1 ${message.isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
            {message.timestamp.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  );
}

function ChatInput({ onSendMessage, disabled }: { onSendMessage: (text: string) => void; disabled?: boolean }) {
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (inputText.trim()) {
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
    <div className="flex gap-2 p-4 bg-white border-t border-gray-200">
      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="メッセージを入力..."
        disabled={disabled}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
      <button
        onClick={handleSend}
        disabled={!inputText.trim() || disabled}
        className="px-6 py-2 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5B21B6] hover:to-[#7C3AED] disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded-full transition-all duration-200 transform hover:scale-105 disabled:scale-100"
      >
        送信
      </button>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="absolute bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] box-border content-stretch flex flex-row gap-2.5 h-[61px] items-center justify-start left-0 px-[13px] py-3 top-0 w-[390px] shadow-lg z-10">
      <button 
        onClick={onClick}
        className="h-9 w-[35px] transition-transform hover:scale-110 active:scale-95"
        aria-label="戻る"
      >
        <svg
          className="block size-full"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 35 36"
        >
          <g id="Arrow left">
            <path
              d={svgPaths.p34d70400}
              id="Icon"
              stroke="white"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="4"
            />
          </g>
        </svg>
      </button>
    </div>
  );
}

export default function ChatRoom({ onBack }: { onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatRooms, setChatRooms] = useState<ApiChatRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<ApiChatRoom | null>(null);
  const [currentKeyword, setCurrentKeyword] = useState('共感ワード');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const rooms = await apiClient.getChatRooms();
        setChatRooms(rooms);
        
        if (rooms.length > 0) {
          const room = rooms[0]; // 最初のルームを使用
          setCurrentRoom(room);
          setCurrentKeyword(room.empathy_words[0]?.word || '共感ワード');
          
          // メッセージを取得
          const apiMessages = await apiClient.getChatMessages(room.id);
          const convertedMessages: Message[] = apiMessages.map(msg => ({
            id: msg.id,
            text: msg.content,
            timestamp: new Date(msg.created_at),
            isOwn: false, // 匿名トークンで判定する必要があります
            username: '匿名ユーザー'
          }));
          setMessages(convertedMessages);
        }
      } catch (err) {
        console.error('チャットルーム取得エラー:', err);
        setError('チャットルームの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatRooms();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!currentRoom) return;

    try {
      const newApiMessage = await apiClient.sendMessage(currentRoom.id, text);
      
      const newMessage: Message = {
        id: newApiMessage.id,
        text: newApiMessage.content,
        timestamp: new Date(newApiMessage.created_at),
        isOwn: true,
        username: 'あなた'
      };
      
      setMessages(prev => [...prev, newMessage]);
    } catch (err) {
      console.error('メッセージ送信エラー:', err);
      setError('メッセージの送信に失敗しました');
    }
  };

  return (
    <div className="relative size-full bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9]" data-name="チャットルーム画面">
      <BackButton onClick={onBack} />
      
      {/* Header with keyword and countdown */}
      <div className="pt-[61px] pb-4 px-4 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="text-center mb-4">
          <AnimatedKeyword keyword={currentKeyword} />
        </div>
        <CountdownTimer />
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-20" style={{ height: 'calc(100vh - 200px)' }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#8B5CF6] border-t-transparent mb-4 mx-auto"></div>
              <p className="text-[#6B7280] animate-pulse">チャットルームを読み込み中...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-red-600 bg-red-50 p-4 rounded">
              {error}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 text-center">
              <div className="inline-block bg-gradient-to-r from-[#10B981] to-[#3B82F6] text-white px-4 py-2 rounded-full text-sm">
                「{currentKeyword}」をテーマにしたチャットルームが開始されました
              </div>
            </div>
            
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <p>まだメッセージがありません</p>
                <p className="text-sm mt-2">最初のメッセージを送ってみましょう！</p>
              </div>
            ) : (
              messages.map(message => (
                <ChatMessage key={message.id} message={message} />
              ))
            )}
            
            <div ref={messagesEndRef} />
            
            <div className="text-center text-xs text-gray-500 mt-4">
              💡 このチャットルームは24時間後に自動終了します
            </div>
          </>
        )}
      </div>

      {/* Chat input */}
      <div className="absolute bottom-0 left-0 right-0">
        <ChatInput onSendMessage={handleSendMessage} disabled={isLoading || !!error} />
      </div>
    </div>
  );
}