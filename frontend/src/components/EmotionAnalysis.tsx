import { useState, useEffect, useMemo } from "react";

interface EmotionBubble {
  emotion: string;
  count: number;
  color: string;
  position: { x: number; y: number };
  delay: number;
  size: number;
  rank: number;
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="absolute top-4 left-4 z-20">
      <button
        onClick={onClick}
        className="w-14 h-14 bg-white/40 hover:bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg"
        aria-label="戻る"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
    </div>
  );
}

function EmotionBubbleComponent({ bubble, isSelected, onClick }: {
  bubble: EmotionBubble;
  isSelected: boolean;
  onClick: () => void;
  screenWidth: number;
}) {
  const bubbleSize = bubble.size;
  const fontSize = Math.max(bubbleSize / 8, 10);
  const labelFontSize = Math.max(bubbleSize / 12, 8);

  return (
    <div
      className={`absolute transition-all duration-300 cursor-pointer hover:scale-110 ${isSelected ? 'scale-110 z-30' : 'hover:z-20'
        }`}
      style={{
        left: `${bubble.position.x}px`,
        top: `${bubble.position.y}px`,
        animationDelay: `${bubble.delay}s`,
        width: `${bubbleSize}px`,
        height: `${bubbleSize}px`,
        zIndex: isSelected ? 30 : 10
      }}
      onClick={onClick}
    >
      <div
        className={`w-full h-full rounded-full flex flex-col items-center justify-center shadow-lg transition-all duration-300 relative ${isSelected ? 'ring-4 ring-white/50' : ''
          }`}
        style={{
          background: bubble.color,
          animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`
        }}
      >
        {/* ランキングとカウント数のラベル（バブル内上部に配置） */}
        <div
          className="absolute top-2 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1"
          style={{
            fontSize: `${labelFontSize}px`,
          }}
        >
          <span className="font-bold text-white">#{bubble.rank}</span>
          <span className="font-semibold text-white/80">×{bubble.count}</span>
        </div>

        {/* 感情テキスト（バブル中央に配置） */}
        <div className="text-center mt-3">
          <span
            className="text-white font-bold block leading-tight"
            style={{ fontSize: `${fontSize}px` }}
          >
            {bubble.emotion}
          </span>
        </div>
      </div>
    </div>
  );
}

// 二つの円が重なっているかチェック
function isOverlapping(pos1: { x: number; y: number }, size1: number, pos2: { x: number; y: number }, size2: number, margin: number = 10) {
  const centerX1 = pos1.x + size1 / 2;
  const centerY1 = pos1.y + size1 / 2;
  const centerX2 = pos2.x + size2 / 2;
  const centerY2 = pos2.y + size2 / 2;

  const distance = Math.sqrt(Math.pow(centerX2 - centerX1, 2) + Math.pow(centerY2 - centerY1, 2));
  const minDistance = (size1 + size2) / 2 + margin;

  return distance < minDistance;
}

// 重なりを避ける位置を見つける
function findNonOverlappingPosition(
  targetSize: number,
  existingBubbles: Array<{ position: { x: number; y: number }; size: number }>,
  containerWidth: number,
  containerHeight: number,
  centerX: number,
  centerY: number,
  preferredRadius: number
): { x: number; y: number } {
  const margin = 15;
  const maxAttempts = 120;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // 放射状の角度をより均等に分散
    const angle = (Math.PI * 2 * attempt) / 24 + (attempt % 24) * 0.1;
    // 半径を段階的に増やす（コンテナサイズに応じて調整）
    const radiusScale = Math.min(containerWidth, containerHeight) / 400;
    const radius = preferredRadius + Math.floor(attempt / 24) * (35 * radiusScale);

    let x = centerX + Math.cos(angle) * radius - targetSize / 2;
    let y = centerY + Math.sin(angle) * radius - targetSize / 2;

    // 境界内に収める
    x = Math.max(margin, Math.min(containerWidth - targetSize - margin, x));
    y = Math.max(margin, Math.min(containerHeight - targetSize - margin, y));

    const newPosition = { x, y };

    // 既存のバブルとの重なりをチェック
    let hasOverlap = false;
    for (const existing of existingBubbles) {
      if (isOverlapping(newPosition, targetSize, existing.position, existing.size)) {
        hasOverlap = true;
        break;
      }
    }

    if (!hasOverlap) {
      return newPosition;
    }
  }

  // 最終手段：中心から適度な距離でランダム配置
  const fallbackRadius = Math.min(containerWidth, containerHeight) * 0.2;
  const fallbackAngle = Math.random() * Math.PI * 2;
  let x = centerX + Math.cos(fallbackAngle) * fallbackRadius - targetSize / 2;
  let y = centerY + Math.sin(fallbackAngle) * fallbackRadius - targetSize / 2;

  x = Math.max(margin, Math.min(containerWidth - targetSize - margin, x));
  y = Math.max(margin, Math.min(containerHeight - targetSize - margin, y));

  return { x, y };
}

function generateNonOverlappingPositions(
  emotions: Array<{ count: number; size: number }>,
  containerWidth: number,
  containerHeight: number
) {
  // コンテナの中心を正しく計算
  const centerX = containerWidth / 2;
  const centerY = containerHeight / 2;
  const positions: Array<{ x: number; y: number }> = [];
  const placedBubbles: Array<{ position: { x: number; y: number }; size: number }> = [];

  // サイズの大きい順にソート（大きなバブルを先に配置）
  const sortedEmotions = emotions
    .map((emotion, index) => ({ ...emotion, originalIndex: index }))
    .sort((a, b) => b.size - a.size);

  for (let i = 0; i < sortedEmotions.length; i++) {
    const emotion = sortedEmotions[i];

    // コンテナサイズに応じて基本半径を調整
    const containerScale = Math.min(containerWidth, containerHeight) / 400;
    const baseRadius = Math.max(50, 40 * containerScale) + Math.floor(i / 3) * (30 * containerScale);

    const position = findNonOverlappingPosition(
      emotion.size,
      placedBubbles,
      containerWidth,
      containerHeight,
      centerX,
      centerY,
      baseRadius
    );

    placedBubbles.push({ position, size: emotion.size });
    positions[emotion.originalIndex] = position;
  }

  return positions;
}

export default function EmotionAnalysis({ onBack }: { onBack?: () => void }) {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [screenWidth, setScreenWidth] = useState(400);
  const [containerDimensions, setContainerDimensions] = useState({ width: 600, height: 400 });

  // 基本の感情データ
  const baseEmotions = [
    { emotion: "嬉しい", count: 8, color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
    { emotion: "疲れた", count: 5, color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
    { emotion: "楽しい", count: 6, color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
    { emotion: "美味しい", count: 4, color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" },
    { emotion: "感謝", count: 7, color: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
    { emotion: "仕事", count: 3, color: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" },
    { emotion: "驚き", count: 2, color: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)" },
    { emotion: "安心", count: 9, color: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)" }
  ];

  // count数によるサイズ計算とランキング付け
  const emotions = useMemo(() => {
    // カウント数でソートしてランキングを付ける
    const sortedByCount = [...baseEmotions].sort((a, b) => b.count - a.count);
    const rankedEmotions = sortedByCount.map((emotion, index) => ({
      ...emotion,
      rank: index + 1
    }));

    // サイズ計算（count数に応じて70-130pxの範囲に調整）
    const maxCount = Math.max(...rankedEmotions.map(e => e.count));
    const minCount = Math.min(...rankedEmotions.map(e => e.count));
    const countRange = maxCount - minCount;

    const emotionsWithSize = rankedEmotions.map(emotion => ({
      ...emotion,
      size: countRange > 0
        ? 70 + ((emotion.count - minCount) / countRange) * 60 // サイズ範囲を調整
        : 100 // 全て同じcountの場合
    }));

    // 重なりを避けた配置
    const positions = generateNonOverlappingPositions(emotionsWithSize, containerDimensions.width, containerDimensions.height);

    return emotionsWithSize.map((emotion, index) => ({
      ...emotion,
      position: positions[index],
      delay: index * 0.15 // 少し短縮
    }));
  }, [containerDimensions]);

  // 画面サイズの監視
  useEffect(() => {
    const updateScreenWidth = () => {
      setScreenWidth(window.innerWidth);
      // コンテナサイズを画面サイズに応じて適切に調整
      const width = Math.min(window.innerWidth * 0.85, 1000);
      const height = Math.min(window.innerHeight * 0.6, 650);
      setContainerDimensions({ width, height });
    };

    updateScreenWidth();
    window.addEventListener('resize', updateScreenWidth);
    return () => window.removeEventListener('resize', updateScreenWidth);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleEmotionClick = (emotion: string) => {
    setSelectedEmotion(selectedEmotion === emotion ? null : emotion);
  };

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes pulse-gradient {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        .animate-pulse-gradient {
          animation: pulse-gradient 2s ease-in-out infinite;
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>

      <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-1/4 -right-8 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-8 left-1/3 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
        </div>

        {onBack && <BackButton onClick={onBack} />}

        {/* Main content container */}
        <div className="flex flex-col items-center justify-center h-full px-4">
          <div className="bg-gray-800/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl mx-auto" style={{ width: '90%' }}>

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-white text-2xl md:text-3xl font-bold mb-2">
                今日の気持ちは？
              </h1>
              <p className="text-gray-300 text-sm md:text-base">
                あなたの感情ワードを選んでください
              </p>
            </div>

            {/* Emotion bubbles container */}
            <div
              className="relative mb-8 mx-auto bg-gray-700/20 rounded-2xl border border-white/10"
              style={{
                width: '95%',
                height: `${containerDimensions.height}px`
              }}
            >
              {isAnalyzing ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mb-4 mx-auto"></div>
                    <p className="text-white/80 animate-pulse">
                      感情を分析中...
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {emotions.map((bubble, index) => (
                    <EmotionBubbleComponent
                      key={index}
                      bubble={bubble}
                      isSelected={selectedEmotion === bubble.emotion}
                      onClick={() => handleEmotionClick(bubble.emotion)}
                      screenWidth={screenWidth}
                    />
                  ))}
                </>
              )}
            </div>

            {/* Selected emotion info */}
            {selectedEmotion && (
              <div className="text-center animate-fade-in">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4">
                  <p className="text-white text-lg font-semibold mb-1">
                    「{selectedEmotion}」を選択しました
                  </p>
                  <p className="text-gray-300 text-sm">
                    {emotions.find(e => e.emotion === selectedEmotion)?.count || 0} 回記録されています
                    （第{emotions.find(e => e.emotion === selectedEmotion)?.rank || 0}位）
                  </p>
                </div>
              </div>
            )}

            {/* Action button */}
            {!isAnalyzing && (
              <div className="text-center">
                <button
                  onClick={() => console.log('マッチング開始')}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl animate-pulse-gradient"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    マッチングを開始
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}