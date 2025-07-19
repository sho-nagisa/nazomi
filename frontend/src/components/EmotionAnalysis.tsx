import svgPaths from "../../imports/svg-l5kd0cjzun";
import { useState, useEffect } from "react";

interface WordCloudItem {
  word: string;
  count: number;
  color: string;
  size: number;
  x: number;
  y: number;
  delay: number;
}

function AnimatedWordCloud() {
  const [words] = useState<WordCloudItem[]>([
    { word: "疲れた", count: 8, color: "#3B82F6", size: 100, x: 0, y: 0, delay: 0 },
    { word: "快晴", count: 5, color: "#EC4899", size: 70, x: 135, y: 78, delay: 0.3 },
    { word: "犬", count: 3, color: "#6B7280", size: 50, x: 70, y: 114, delay: 0.6 },
    { word: "仕事", count: 6, color: "#8B5CF6", size: 80, x: 200, y: 30, delay: 0.9 },
    { word: "友達", count: 4, color: "#10B981", size: 60, x: 50, y: 180, delay: 1.2 },
    { word: "美味しい", count: 7, color: "#F59E0B", size: 85, x: 180, y: 130, delay: 1.5 }
  ]);

  return (
    <div className="relative h-[300px] w-full overflow-hidden">
      {words.map((item, index) => (
        <div
          key={index}
          className="absolute animate-pulse hover:scale-110 transition-transform duration-300 cursor-pointer"
          style={{
            left: `${item.x}px`,
            top: `${item.y}px`,
            animationDelay: `${item.delay}s`,
            animationDuration: '2s'
          }}
        >
          <div
            className="relative flex items-center justify-center rounded-full shadow-lg animate-bounce"
            style={{
              width: `${item.size}px`,
              height: `${item.size * 0.6}px`,
              backgroundColor: `${item.color}20`,
              border: `2px solid ${item.color}`,
              animationDelay: `${item.delay + 0.5}s`,
              animationDuration: '3s'
            }}
          >
            <span
              className="font-['SF_Pro:Heavy',_'Noto_Sans_JP:Bold',_sans-serif] font-[860] text-center tracking-[1px] select-none"
              style={{
                color: item.color,
                fontSize: `${Math.min(item.size / 4, 20)}px`,
                fontVariationSettings: "'wdth' 100"
              }}
            >
              {item.word}
            </span>
            <div
              className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md"
              style={{ borderColor: item.color, borderWidth: '2px' }}
            >
              <span className="text-xs font-bold" style={{ color: item.color }}>
                {item.count}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function HeartMatchingButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        className="group relative overflow-hidden bg-gradient-to-r from-[#EC4899] via-[#F59E0B] to-[#EF4444] hover:from-[#BE185D] hover:via-[#D97706] hover:to-[#DC2626] transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-2xl rounded-full p-4"
        aria-label="マッチング開始"
      >
        {/* Heart Shape */}
        <div className="flex items-center justify-center">
          <svg
            className="w-8 h-8 text-white animate-pulse group-hover:animate-ping"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        
        {/* Sparkle animations */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full animate-ping opacity-0 group-hover:opacity-100"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
      </button>
      
      <div className="mt-3 text-center">
        <span className="font-['SF_Pro:Heavy',_'Noto_Sans_JP:Bold',_sans-serif] font-[860] text-transparent bg-gradient-to-r from-[#EC4899] to-[#EF4444] bg-clip-text text-[14px] tracking-[0.7px]">
          マッチング
        </span>
      </div>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="absolute bg-gradient-to-r from-[#10B981] to-[#3B82F6] box-border content-stretch flex flex-row gap-2.5 h-[61px] items-center justify-start left-0 px-[13px] py-3 top-0 w-[390px] shadow-lg z-10">
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

function AnimatedTitle() {
  return (
    <div className="text-center mb-8">
      <div
        className="font-['SF_Pro:Heavy',_'Noto_Sans_JP:Bold',_sans-serif] font-[860] text-transparent bg-gradient-to-r from-[#6366F1] via-[#EC4899] to-[#8B5CF6] bg-clip-text text-[32px] tracking-[1.6px] animate-pulse"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[normal] animate-fade-in">
          今日の共感ワードは…？
        </p>
      </div>
      <div className="mt-2 text-center">
        <span className="text-[#6B7280] text-[14px]">
          💫 あなたと友達の日記から抽出されました
        </span>
      </div>
    </div>
  );
}

export default function EmotionAnalysis({ onBack }: { onBack: () => void }) {
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleMatching = () => {
    console.log('マッチング開始');
    // ここでマッチング処理を実装
  };

  return (
    <div className="relative size-full bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9]" data-name="共感ワード表示画面">
      <BackButton onClick={onBack} />
      
      <div className="pt-[80px] px-6 h-full">
        <AnimatedTitle />
        
        <div className="relative bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 mb-8">
          {isAnalyzing ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#EC4899] border-t-transparent mb-4 mx-auto"></div>
                <p className="text-[#6B7280] animate-pulse">
                  日記を分析中...
                </p>
              </div>
            </div>
          ) : (
            <AnimatedWordCloud />
          )}
        </div>
        
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-[#6366F1]/10 to-[#EC4899]/10 rounded-lg p-4 mb-4">
            <p className="text-[#374151] text-[14px] mb-2">
              🎯 マッチ率が高い共感ワードを見つけました！
            </p>
            <p className="text-[#6B7280] text-[12px]">
              同じキーワードを持つユーザーとつながりませんか？
            </p>
          </div>
        </div>
        
        <div className="flex justify-center">
          <HeartMatchingButton onClick={handleMatching} />
        </div>
      </div>
    </div>
  );
}