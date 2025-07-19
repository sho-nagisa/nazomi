import React, { useState } from "react";
import svgPaths from "../../imports/svg-w7nub29lr1";
import { apiClient, DiaryCreate } from '../services/api';

type Emotion = 'happy' | 'sad' | 'angry' | 'excited' | 'calm' | 'anxious' | 'grateful' | 'lonely' | null;

function EmotionButton({ 
  emotion, 
  isSelected, 
  onClick, 
  label, 
  color 
}: { 
  emotion: Emotion; 
  isSelected: boolean; 
  onClick: () => void; 
  label: string; 
  color: string; 
}) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${
        isSelected 
          ? `${color} text-white shadow-lg` 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
      aria-label={label}
    >
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

function EmotionSelector({ selectedEmotion, onEmotionSelect }: { 
  selectedEmotion: Emotion; 
  onEmotionSelect: (emotion: Emotion) => void;
}) {
  const emotions = [
    { value: 'happy' as const, label: '😊 嬉しい', color: 'bg-green-500' },
    { value: 'sad' as const, label: '😢 悲しい', color: 'bg-blue-500' },
    { value: 'angry' as const, label: '😠 怒り', color: 'bg-red-500' },
    { value: 'excited' as const, label: '🤩 興奮', color: 'bg-yellow-500' },
    { value: 'calm' as const, label: '😌 落ち着き', color: 'bg-teal-500' },
    { value: 'anxious' as const, label: '😰 不安', color: 'bg-orange-500' },
    { value: 'grateful' as const, label: '🙏 感謝', color: 'bg-purple-500' },
    { value: 'lonely' as const, label: '😔 寂しい', color: 'bg-gray-500' },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 w-full max-w-md">
      {emotions.map((emotion) => (
        <EmotionButton
          key={emotion.value}
          emotion={emotion.value}
          isSelected={selectedEmotion === emotion.value}
          onClick={() => onEmotionSelect(emotion.value)}
          label={emotion.label}
          color={emotion.color}
        />
      ))}
    </div>
  );
}

function Textarea({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div
      className="bg-white min-h-20 min-w-60 relative rounded-lg shrink-0 w-full shadow-sm border border-gray-200 focus-within:border-[#6366F1] focus-within:ring-2 focus-within:ring-[#6366F1]/20 transition-all duration-200"
      data-name="Textarea"
    >
      <div className="min-h-inherit min-w-inherit overflow-clip relative size-full">
        <div className="box-border content-stretch flex flex-row items-start justify-start min-h-inherit min-w-inherit px-4 py-3 relative w-full">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="今日は..."
            className="basis-0 font-['Inter:Regular',_'Noto_Sans_JP:Regular',_sans-serif] font-normal grow leading-[1.4] min-h-[80px] min-w-px not-italic relative shrink-0 text-[#1e1e1e] text-[16px] text-left resize-none outline-none bg-transparent"
          />
          <div
            className="absolute bottom-[6.019px] right-[5.019px] size-[6.627px]"
            data-name="Drag"
          >
            <div
              className="absolute bottom-[-5.335%] left-[-5.335%] right-[-5.335%] top-[-5.335%]"
              style={
                {
                  "--stroke-0":
                    "rgba(179.000004529953, 179.000004529953, 179.000004529953, 1)",
                } as React.CSSProperties
              }
            >
              <svg
                className="block size-full"
                fill="none"
                preserveAspectRatio="none"
                role="presentation"
                viewBox="0 0 8 8"
              >
                <path
                  d={svgPaths.p508fbdc}
                  id="Drag"
                  stroke="var(--stroke-0, #B3B3B3)"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TextareaField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-2 h-[217px] items-start justify-start p-0 relative shrink-0 w-[299px]"
      data-name="Textarea Field"
    >
      <div className="font-['Inter:Regular',_'Noto_Sans_JP:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#374151] text-[16px] text-left w-full">
        <p className="block leading-[1.4]">今日はどんな1日でしたか？</p>
      </div>
      <Textarea value={value} onChange={onChange} />
    </div>
  );
}

function SubmitButton({ onClick, disabled, isLoading }: { onClick: () => void; disabled: boolean; isLoading?: boolean }) {
  return (
    <div className="h-10 relative shrink-0 w-[88px]">
      <button
        onClick={onClick}
        disabled={disabled || isLoading}
        className="absolute bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5B21B6] hover:to-[#7C3AED] disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:scale-100 rounded-lg h-10 w-[88px]"
        data-name="Button"
      >
        <div className="box-border content-stretch flex flex-row gap-2 items-center justify-center overflow-clip p-[12px] relative">
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          ) : (
            <div className="font-['Inter:Regular',_'Noto_Sans_JP:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[16px] text-left text-white text-nowrap">
              <p className="block leading-none whitespace-pre">投稿する</p>
            </div>
          )}
        </div>
      </button>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="absolute bg-gradient-to-r from-[#EC4899] to-[#F59E0B] box-border content-stretch flex flex-row gap-2.5 h-[61px] items-center justify-start left-0 px-[13px] py-3 top-0 w-[390px] shadow-lg">
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

export default function DiaryEntry({ onBack }: { onBack: () => void }) {
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion>(null);
  const [diaryText, setDiaryText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (selectedEmotion && diaryText.trim()) {
      console.log('日記投稿開始:', { selectedEmotion, diaryText });
      setIsSubmitting(true);
      setError(null);
      
      try {
        const diaryData: DiaryCreate = {
          content: diaryText,
          emotion_tag: selectedEmotion,
        };
        
        console.log('送信データ:', diaryData);
        const result = await apiClient.createDiary(diaryData);
        console.log('日記投稿成功:', result);
        onBack(); // 投稿後にホーム画面に戻る
      } catch (err) {
        console.error('日記投稿エラー:', err);
        setError(`投稿に失敗しました: ${err.message}`);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      console.log('バリデーションエラー:', { selectedEmotion, diaryText: diaryText.trim() });
    }
  };

  const isSubmitDisabled = !selectedEmotion || !diaryText.trim();

  return (
    <div className="relative size-full bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9]" data-name="日記投稿画面">
      <div
        className="absolute bg-white/80 backdrop-blur-sm box-border content-stretch flex flex-col gap-2.5 h-[844px] items-center justify-center left-0 overflow-clip p-[10px] top-0 w-[390px] shadow-lg border border-white/20 rounded-lg"
        data-name="日記投稿画面"
      >
        <div className="mb-8">
          <h2 className="text-center text-[#374151] mb-4">今日の気持ちを選んでください</h2>
          <EmotionSelector 
            selectedEmotion={selectedEmotion}
            onEmotionSelect={setSelectedEmotion}
          />
        </div>
        
        <div className="box-border content-stretch flex flex-col gap-2.5 items-end justify-end px-9 py-0 relative shrink-0">
          <TextareaField value={diaryText} onChange={setDiaryText} />
        </div>
        
        <SubmitButton onClick={handleSubmit} disabled={isSubmitDisabled} isLoading={isSubmitting} />
        
        {error && (
          <div className="mt-4 text-center text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
        
        {selectedEmotion && !error && (
          <div className="mt-4 text-center text-sm text-gray-600">
            {selectedEmotion === 'happy' && '🌟 素晴らしい気持ちですね！'}
            {selectedEmotion === 'sad' && '💙 辛い時もあります、大丈夫ですよ'}
            {selectedEmotion === 'angry' && '🔥 怒りの感情も大切です'}
            {selectedEmotion === 'excited' && '🎉 ワクワクする気持ちですね！'}
            {selectedEmotion === 'calm' && '😌 落ち着いた気持ちですね'}
            {selectedEmotion === 'anxious' && '🤗 不安な気持ち、一緒に乗り越えましょう'}
            {selectedEmotion === 'grateful' && '🙏 感謝の気持ち、素敵です'}
            {selectedEmotion === 'lonely' && '🤝 寂しい気持ち、あなたは一人じゃありません'}
          </div>
        )}
      </div>
      
      <BackButton onClick={onBack} />
    </div>
  );
}