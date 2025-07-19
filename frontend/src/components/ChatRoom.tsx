import React, { useState, useEffect } from "react";

// Define SVG paths locally for self-contained code
const svgPaths = {
  // Path for the left arrow in BackButton
  p34d70400: "M25 18H10M10 18L18 10M10 18L18 26",
};

// --- Interfaces ---
interface Message {
  id: string;
  text: string;
  timestamp: Date;
  isOwn: boolean;
  username: string;
}

// --- Helper Functions ---
// Formats a number to always have two digits (e.g., 5 -> "05")
const formatTime = (num: number) => {
  return num < 10 ? `0${num}` : num;
};

// --- Components ---

/**
 * AnimatedKeyword Component
 * Displays a keyword with a gradient text and bounce animation.
 * @param {object} props - Component props.
 * @param {string} props.keyword - The keyword to display.
 */
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

/**
 * CountdownTimer Component
 * Displays a 24-hour countdown and a progress bar.
 * The countdown starts when the component mounts.
 */
function CountdownTimer() {
  // Define the total duration for the countdown in milliseconds (24 hours)
  const TOTAL_DURATION_MS = 24 * 60 * 60 * 1000;

  // State to store the target end timestamp (when the 24 hours will be up)
  // Initialized to null, will be set in useEffect.
  const [endTime, setEndTime] = useState<number | null>(null);

  // State to store the remaining time (hours, minutes, seconds)
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Effect to set the end time when the component mounts.
  // This ensures the 24-hour countdown begins from the moment the component loads.
  useEffect(() => {
    // If endTime is not already set (e.g., if it were loaded from localStorage),
    // calculate it as current time + TOTAL_DURATION_MS.
    if (endTime === null) {
      const calculatedEndTime = Date.now() + TOTAL_DURATION_MS;
      setEndTime(calculatedEndTime);
    }
  }, [endTime]); // Dependency array includes endTime to prevent re-setting if it's loaded from elsewhere

  // Effect to update the countdown every second.
  useEffect(() => {
    // Do not start the timer if endTime has not been set yet.
    if (endTime === null) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const distance = endTime - now; // Time remaining in milliseconds

      if (distance < 0) {
        // If countdown has finished (distance is negative)
        clearInterval(timer); // Stop the interval
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 }); // Set time to all zeros
        // Optional: Add logic here for what happens when the countdown ends (e.g., display "Time's Up!")
      } else {
        // Calculate remaining hours, minutes, and seconds
        setTimeLeft({
          hours: Math.floor(distance / (1000 * 60 * 60)), // Total hours remaining
          minutes: Math.floor((distance / (1000 * 60)) % 60), // Minutes remaining within the hour
          seconds: Math.floor((distance / 1000) % 60), // Seconds remaining within the minute
        });
      }
    }, 1000); // Update every 1000 milliseconds (1 second)

    // Cleanup function: This runs when the component unmounts or when dependencies change.
    // It's crucial to clear the interval to prevent memory leaks.
    return () => clearInterval(timer);
  }, [endTime]); // Re-run this effect if endTime changes

  // Calculate progress percentage for the bar.
  // The bar will fill up as time elapses (from 0% to 100%).
  let progressPercentage = 0;
  if (endTime !== null) {
    const now = Date.now();
    // Calculate elapsed time from the start of the 24-hour period
    const startTime = endTime - TOTAL_DURATION_MS;
    const elapsedMs = now - startTime;

    // Ensure percentage is within 0-100 range
    progressPercentage = Math.min(100, Math.max(0, (elapsedMs / TOTAL_DURATION_MS) * 100));
  }

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
          style={{ width: `${progressPercentage}%` }} // Apply the calculated width
        ></div>
      </div>
    </div>
  );
}

/**
 * ChatMessage Component
 * Displays a single chat message, styled differently for own messages.
 * @param {object} props - Component props.
 * @param {Message} props.message - The message object to display.
 */
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

/**
 * ChatInput Component
 * Provides an input field and a send button for chat messages.
 * @param {object} props - Component props.
 * @param {(text: string) => void} props.onSendMessage - Callback function to send a message.
 */
function ChatInput({ onSendMessage }: { onSendMessage: (text: string) => void }) {
  const [inputText, setInputText] = useState('');

  // Handles sending the message
  const handleSend = () => {
    if (inputText.trim()) { // Only send if input is not empty
      onSendMessage(inputText.trim());
      setInputText(''); // Clear input field after sending
    }
  };

  // Handles Enter key press to send message (Shift + Enter for new line)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent default Enter behavior (e.g., new line in textarea)
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
        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
      />
      <button
        onClick={handleSend}
        disabled={!inputText.trim()} // Disable button if input is empty
        className="px-6 py-2 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5B21B6] hover:to-[#7C3AED] disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded-full transition-all duration-200 transform hover:scale-105 disabled:scale-100"
      >
        送信
      </button>
    </div>
  );
}

/**
 * BackButton Component
 * A styled back button with an SVG arrow.
 * @param {object} props - Component props.
 * @param {() => void} props.onClick - Callback function for button click.
 */
function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="absolute bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] box-border content-stretch flex flex-row gap-2.5 h-[61px] items-center justify-start left-0 px-[13px] py-3 top-0 w-full shadow-lg z-10">
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
              d={svgPaths.p34d70400} // Using the locally defined SVG path
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

/**
 * ChatRoom Component (Main Export)
 * The main chat room interface, integrating all sub-components.
 * @param {object} props - Component props.
 * @param {() => void} props.onBack - Callback function to navigate back.
 */
export default function ChatRoom({ onBack }: { onBack: () => void }) {
  // State to manage chat messages
  const [messages, setMessages] = useState<Message[]>([
    // Initial messages can be added here or fetched from an API
    // {
    //   id: '1',
    //   text: '今日も一日お疲れ様でした！',
    //   timestamp: new Date(Date.now() - 300000),
    //   isOwn: false,
    //   username: 'さくら'
    // },
    // {
    //   id: '2',
    //   text: 'お疲れ様です。今日は共感ワードで繋がれて嬉しいです😊',
    //   timestamp: new Date(Date.now() - 240000),
    //   isOwn: true,
    //   username: 'あなた'
    // },
    // {
    //   id: '3',
    //   text: '同じような気持ちを抱えている人がいるんだなって安心しました',
    //   timestamp: new Date(Date.now() - 180000),
    //   isOwn: false,
    //   username: 'ゆうき'
    // }
  ]);

  // State for the current chat keyword
  const [currentKeyword] = useState('共感ワード');

  // Handles adding a new message to the chat
  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(), // Unique ID for the message
      text,
      timestamp: new Date(), // Current time
      isOwn: true, // Message sent by the current user
      username: 'あなた' // Placeholder username for own messages
    };
    setMessages(prev => [...prev, newMessage]); // Add new message to the list
  };

  return (
    <div className="relative size-full min-h-screen flex flex-col bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9]" data-name="チャットルーム画面">
      {/* Back button at the top */}
      <BackButton onClick={onBack} />
      
      {/* Header section with keyword and countdown timer */}
      <div className="pt-[61px] pb-4 px-4 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="text-center mb-4">
          <AnimatedKeyword keyword={currentKeyword} />
        </div>
        <CountdownTimer />
      </div>

      {/* Chat messages display area */}
      {/* flex-1 makes this div take up available vertical space */}
      {/* overflow-y-auto enables vertical scrolling for messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mb-4 text-center">
          <div className="inline-block bg-gradient-to-r from-[#10B981] to-[#3B82F6] text-white px-4 py-2 rounded-full text-sm">
            「{currentKeyword}」をテーマにしたチャットルームが開始されました
          </div>
        </div>
        
        {/* Map through messages and render ChatMessage for each */}
        {messages.map(message => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        <div className="text-center text-xs text-gray-500 mt-4 pb-4">
          💡 このチャットルームは24時間後に自動終了します
        </div>
      </div>

      {/* Chat input section at the bottom */}
      {/* absolute positioning to keep it at the bottom */}
      <div className="sticky bottom-0 left-0 right-0">
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}
