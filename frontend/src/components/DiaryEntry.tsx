import { useState } from "react";
import { diaryApi, DiaryCreate } from "../lib/api";

type Emotion =
  | 'happy'
  | 'angry'
  | 'sad'
  | 'excited'
  | 'calm'
  | 'embarrassed'
  | 'gratitude'
  | 'alone'
  | null;

// SVG paths (simplified for demo)
const svgPaths = {
  smile: "M16 20s2-4 8-4 8 4 8 4M8 14h.01M24 14h.01",
  angry: "M16 20h8M8 14h.01M24 14h.01",
  frown: "M16 20s-2-4-8-4-8 4-8 4M8 14h.01M24 14h.01",
  arrowLeft: "M15 18l-6-6 6-6",
  drag: "M3 3l18 18M3 21l18-18"
};

function EmotionButton({
  emotion,
  isSelected,
  onClick,
  emoji,
  label,
  selectedMessage
}: {
  emotion: Emotion;
  isSelected: boolean;
  onClick: () => void;
  emoji: string;
  label: string;
  selectedMessage: string;
}) {
  const colors = {
    happy: { bg: 'bg-emerald-500', border: 'border-emerald-500', hover: 'hover:bg-emerald-600' },
    neutral: { bg: 'bg-amber-500', border: 'border-amber-500', hover: 'hover:bg-amber-600' },
    sad: { bg: 'bg-rose-500', border: 'border-rose-500', hover: 'hover:bg-rose-600' }
  };

  const colorScheme = colors[emotion as keyof typeof colors] || colors.neutral;

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={onClick}
        className={`
          flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300
          min-w-24 sm:w-28
          ${isSelected
            ? `${colorScheme.bg} ${colorScheme.border} text-white shadow-lg scale-110`
            : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400 hover:scale-105 hover:shadow-md'
          }
          transform active:scale-95 focus:outline-none focus:ring-4 focus:ring-opacity-50
          ${isSelected ? 'focus:ring-emerald-300' : 'focus:ring-blue-300'}
        `}
        aria-label={label}
      >
        <div className="text-2xl mb-1">{emoji}</div>
        <div className="text-xs font-medium">{label}</div>
      </button>
      {isSelected && (
        <div className="text-xs text-center text-gray-600 animate-fade-in px-2 max-w-20">
          {selectedMessage}
        </div>
      )}
    </div>
  );
}

function EmotionSelector({ selectedEmotion, onEmotionSelect }: {
  selectedEmotion: Emotion;
  onEmotionSelect: (emotion: Emotion) => void;
}) {
  return (
    <div className="w-full justify-content-center">
      <h3 className="text-lg font-medium text-gray-700 text-center mb-6">
        今日の気持ちを選んでください
      </h3>
      <div className="grid grid-cols-4 gap-4 justify-items-center">
        <EmotionButton
          emotion="happy"
          isSelected={selectedEmotion === 'happy'}
          onClick={() => onEmotionSelect('happy')}
          emoji="😊"
          label="嬉しい"
          selectedMessage="素晴らしい！"
        />
        <EmotionButton
          emotion="angry"
          isSelected={selectedEmotion === 'angry'}
          onClick={() => onEmotionSelect('angry')}
          emoji="😠"
          label="怒り"
          selectedMessage="冷静になって！"
        />
        <EmotionButton
          emotion="sad"
          isSelected={selectedEmotion === 'sad'}
          onClick={() => onEmotionSelect('sad')}
          emoji="😢"
          label="悲しい"
          selectedMessage="大丈夫ですよ"
        />
        <EmotionButton
          emotion="excited"
          isSelected={selectedEmotion === 'excited'}
          onClick={() => onEmotionSelect('excited')}
          emoji="🤩"
          label="興奮"
          selectedMessage="イェーイ！"
        />
        <EmotionButton
          emotion="calm"
          isSelected={selectedEmotion === 'calm'}
          onClick={() => onEmotionSelect('calm')}
          emoji="😌"
          label="落ち着き"
          selectedMessage="いいね！"
        />
        <EmotionButton
          emotion="embarrassed"
          isSelected={selectedEmotion === 'embarrassed'}
          onClick={() => onEmotionSelect('embarrassed')}
          emoji="😰"
          label="不安"
          selectedMessage="大丈夫ですよ"
        />
        <EmotionButton
          emotion="gratitude"
          isSelected={selectedEmotion === 'gratitude'}
          onClick={() => onEmotionSelect('gratitude')}
          emoji="🙏"
          label="感謝"
          selectedMessage="大事な気持ちですね"
        />
        <EmotionButton
          emotion="alone"
          isSelected={selectedEmotion === 'alone'}
          onClick={() => onEmotionSelect('alone')}
          emoji="😔"
          label="寂しい"
          selectedMessage="私がついています"
        />
      </div>
    </div>
  );
}

function DiaryTextarea({ value, onChange }: {
  value: string;
  onChange: (value: string) => void
}) {
  return (
    <div className="w-full max-w-md">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        今日はどんな1日でしたか？
      </label>
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="今日は..."
          className="
            w-full min-h-32 p-4 border-2 border-gray-200 rounded-xl
            bg-white/80 backdrop-blur-sm
            focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100
            transition-all duration-300 resize-none outline-none
            placeholder-gray-400 text-gray-800
            shadow-sm hover:shadow-md focus:shadow-lg
          "
          rows={4}
        />
        <div className="absolute bottom-3 right-3 text-gray-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16" stroke="currentColor">
            <path d={svgPaths.drag} strokeWidth="1.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function SubmitButton({ onClick, disabled, isSubmitting }: {
  onClick: () => void;
  disabled: boolean;
  isSubmitting: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isSubmitting}
      className={`
        px-8 py-3 rounded-xl font-medium text-white text-sm
        transition-all duration-300 transform
        ${disabled || isSubmitting
          ? 'bg-gray-400 cursor-not-allowed opacity-60'
          : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl'
        }
        focus:outline-none focus:ring-4 focus:ring-indigo-200
      `}
    >
      {isSubmitting ? '投稿中...' : '投稿する'}
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="absolute top-0 left-0 right-0 z-10">
      <div className="bg-gradient-to-r from-pink-500 to-orange-400 px-4 py-3 shadow-lg">
        <button
          onClick={onClick}
          className="
            flex items-center justify-center w-10 h-10 rounded-full
            bg-white/20 backdrop-blur-sm hover:bg-white/30
            transition-all duration-200 transform hover:scale-110 active:scale-95
            focus:outline-none focus:ring-2 focus:ring-white/50
          "
          aria-label="戻る"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d={svgPaths.arrowLeft} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function DiaryEntry({ onBack }: { onBack: () => void }) {
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion>(null);
  const [diaryText, setDiaryText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (selectedEmotion && diaryText.trim()) {
      setIsSubmitting(true);
      setError(null);
      
      try {
        const diaryData: DiaryCreate = {
          content: diaryText,
          emotion_tag: selectedEmotion,
        };
        
        const response = await diaryApi.create(diaryData);
        console.log('日記投稿成功:', response);
        
        // 成功時の処理
        onBack(); // 投稿後にホーム画面に戻る
      } catch (err) {
        console.error('日記投稿エラー:', err);
        setError(err instanceof Error ? err.message : '投稿に失敗しました');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const isSubmitDisabled = !selectedEmotion || !diaryText.trim();

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <BackButton onClick={onBack} />

      {/* メインコンテンツ */}
      <div className="pt-16 pb-8 px-4 min-h-screen flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full space-y-8">

          {/* 感情選択セクション */}
          <div className="w-full bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <EmotionSelector
              selectedEmotion={selectedEmotion}
              onEmotionSelect={setSelectedEmotion}
            />
          </div>

          {/* テキスト入力セクション */}
          <div className="w-full bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <DiaryTextarea value={diaryText} onChange={setDiaryText} />
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="w-full bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* 投稿ボタン */}
          <div className="w-full flex justify-center pt-4">
            <SubmitButton 
              onClick={handleSubmit} 
              disabled={isSubmitDisabled} 
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* 装飾的な背景要素 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-5 w-16 h-16 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full opacity-20 animate-pulse delay-2000"></div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}