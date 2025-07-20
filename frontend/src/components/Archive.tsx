import svgPaths from "../assets/svg-56hwv34ena";
import { useState, useEffect } from "react";
import { diaryApi, DiaryResponse } from "../lib/api";
import { categoryNames } from "../lib/empathyKeywords";

interface DiaryEntry {
  id: string;
  date: string;
  content: string;
  emotion: 'happy' | 'neutral' | 'sad';
  keywords: string[];
  isExpanded: boolean;
}

function ChevronUp() {
  return (
    <div className="relative shrink-0 size-5" data-name="Chevron up">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 20 20"
      >
        <g id="Chevron up">
          <path
            d="M15 12.5L10 7.5L5 12.5"
            id="Icon"
            stroke="#6366F1"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function ChevronDown() {
  return (
    <div className="relative shrink-0 size-5" data-name="Chevron down">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 20 20"
      >
        <g id="Chevron down">
          <path
            d="M5 7.5L10 12.5L15 7.5"
            id="Icon"
            stroke="#6B7280"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function EmotionIcon({ emotion }: { emotion: 'happy' | 'neutral' | 'sad' }) {
  const colors = {
    happy: '#10B981',
    neutral: '#F59E0B',
    sad: '#EF4444'
  };

  const emojis = {
    happy: '😊',
    neutral: '😐',
    sad: '😢'
  };

  return (
    <div
      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
      style={{ backgroundColor: colors[emotion] }}
    >
      {emojis[emotion]}
    </div>
  );
}

function AccordionItem({
  entry,
  onToggle
}: {
  entry: DiaryEntry;
  onToggle: (id: string) => void;
}) {
  return (
    <div
      className={`relative rounded-lg shrink-0 w-full transition-all duration-300 hover:shadow-lg ${entry.isExpanded ? 'bg-gradient-to-r from-blue-50 to-purple-50' : 'bg-white'
        }`}
      data-name="Accordion Item"
    >
      <div className={`absolute border ${entry.isExpanded ? 'border-[#6366F1]' : 'border-gray-200'
        } border-solid inset-0 pointer-events-none rounded-lg transition-colors duration-300`} />

      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-4 relative w-full">
          {/* Accordion Title */}
          <button
            onClick={() => onToggle(entry.id)}
            className="box-border content-stretch flex flex-row gap-2 items-center justify-start p-0 relative shrink-0 w-full hover:scale-[1.01] transition-transform duration-200"
            data-name="Accordion Title"
          >
            <EmotionIcon emotion={entry.emotion} />
            <div className="basis-0 font-['Inter:Semi_Bold',_sans-serif] font-semibold grow leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#374151] text-[16px] text-left">
              <p className="block leading-[1.4]">{entry.date}</p>
            </div>
            {entry.isExpanded ? <ChevronUp /> : <ChevronDown />}
          </button>

          {/* Accordion Content */}
          {entry.isExpanded && (
            <div
              className="box-border content-stretch flex flex-row items-center justify-center p-0 relative shrink-0 w-full animate-in slide-in-from-top-2 duration-300"
              data-name="Accordion Content"
            >
              <div className="basis-0 flex flex-col font-['Inter:Regular',_'Noto_Sans_JP:Regular',_sans-serif] font-normal grow justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#374151] text-[14px] text-left">
                <p className="block leading-[1.4] whitespace-pre-wrap mb-3">{entry.content}</p>
                
                {/* 共感ワード表示 */}
                {entry.keywords && entry.keywords.length > 0 && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <div className="text-xs text-blue-600 font-medium mb-2">💭 共感ワード</div>
                    <div className="flex flex-wrap gap-2">
                      {entry.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-white text-blue-700 text-xs rounded-full border border-blue-300 shadow-sm"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MonthNavigationButtons({
  currentMonth,
  hasNextMonth,
  hasPrevMonth,
  onNextMonth,
  onPrevMonth
}: {
  currentMonth: string;
  hasNextMonth: boolean;
  hasPrevMonth: boolean;
  onNextMonth: () => void;
  onPrevMonth: () => void;
}) {
  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onPrevMonth}
          disabled={!hasPrevMonth}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#10B981] to-[#3B82F6] hover:from-[#059669] hover:to-[#2563EB] disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 shadow-md"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          前の月
        </button>

        <div className="text-center">
          <div className="font-['SF_Pro:Heavy',_'Noto_Sans_JP:Bold',_sans-serif] font-[860] text-transparent bg-gradient-to-r from-[#6366F1] to-[#EC4899] bg-clip-text text-[18px] tracking-[0.9px]">
            {currentMonth}
          </div>
        </div>

        <button
          onClick={onNextMonth}
          disabled={!hasNextMonth}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] hover:from-[#BE185D] hover:to-[#7C3AED] disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 shadow-md"
        >
          次の月
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="absolute bg-gradient-to-r from-[#10B981] to-[#6366F1] box-border content-stretch flex flex-row gap-2.5 h-[61px] items-center justify-start left-0 px-[13px] py-3 top-0 w-[390px] shadow-lg z-10">
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

function MonthHeader({ month }: { month: string }) {
  return (
    <div className="text-center mb-6 pt-[61px] pb-4">
      <div
        className="font-['SF_Pro:Heavy',_'Noto_Sans_JP:Bold',_sans-serif] font-[860] text-transparent bg-gradient-to-r from-[#6366F1] via-[#EC4899] to-[#8B5CF6] bg-clip-text text-[32px] tracking-[1.6px] animate-pulse"
        style={{ fontVariationSettings: "'wdth' 100" }}
      >
        <p className="adjustLetterSpacing block leading-[normal]">
          {month}の日記
        </p>
      </div>
      <div className="mt-2">
        <span className="text-[#6B7280] text-[14px]">
          📖 あなたの思い出を振り返ってみましょう
        </span>
      </div>
    </div>
  );
}

export default function Archive({ onBack }: { onBack: () => void }) {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [months, setMonths] = useState<string[]>([]);

  // 動的に月の配列を生成
  useEffect(() => {
    const generateMonths = () => {
      const currentDate = new Date();
      const monthsArray: string[] = [];
      
      // 現在の月から過去12ヶ月分を生成（新しい順）
      for (let i = 0; i < 12; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthStr = `${date.getFullYear()}年${date.getMonth() + 1}月`;
        monthsArray.push(monthStr);
      }
      
      setMonths(monthsArray);
    };
    
    generateMonths();
  }, []);

  const currentMonth = months[currentMonthIndex] || '';

  // APIから日記データを取得
  useEffect(() => {
    const loadDiaries = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const diaries = await diaryApi.getMyDiaries(100); // 最大100件取得
        
        // 日記データを月別にグループ化
        const diariesByMonth: Record<string, DiaryResponse[]> = {};
        
        diaries.forEach(diary => {
          const date = new Date(diary.created_at);
          const monthKey = `${date.getFullYear()}年${date.getMonth() + 1}月`;
          
          if (!diariesByMonth[monthKey]) {
            diariesByMonth[monthKey] = [];
          }
          diariesByMonth[monthKey].push(diary);
        });
        
        // 現在の月の日記を取得
        const currentMonthDiaries = diariesByMonth[currentMonth] || [];
        

        
        // UI用の形式に変換
        const convertedEntries: DiaryEntry[] = currentMonthDiaries.map(diary => {
          const date = new Date(diary.created_at);
          const dateStr = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
          
          // 感情タグをUI用の感情に変換
          const emotionMap: Record<string, 'happy' | 'neutral' | 'sad'> = {
            'happy': 'happy',
            'excited': 'happy',
            'gratitude': 'happy',
            'calm': 'neutral',
            'angry': 'sad',
            'sad': 'sad',
            'embarrassed': 'sad',
            'alone': 'sad'
          };
          
          return {
            id: diary.id,
            date: dateStr,
            content: diary.content,
            emotion: emotionMap[diary.emotion_tag] || 'neutral',
            keywords: diary.keywords || [],
            isExpanded: false
          };
        });
        
        // 日付順にソート（新しい順）
        convertedEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        setEntries(convertedEntries);
      } catch (err) {
        console.error('日記取得エラー:', err);
        setError(err instanceof Error ? err.message : '日記の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    loadDiaries();
  }, [currentMonth]);

  const handleToggleEntry = (id: string) => {
    setEntries(prev => prev.map(entry =>
      entry.id === id ? { ...entry, isExpanded: !entry.isExpanded } : entry
    ));
  };

  const handleNextMonth = () => {
    if (currentMonthIndex > 0) {
      setCurrentMonthIndex(currentMonthIndex - 1);
    }
  };

  const handlePrevMonth = () => {
    if (currentMonthIndex < months.length - 1) {
      setCurrentMonthIndex(currentMonthIndex + 1);
    }
  };

  return (
    <div className="relative size-full bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9]" data-name="日記閲覧画面">
      <BackButton onClick={onBack} />

      <div className="px-6 h-full pb-32">
        <MonthHeader month={currentMonth} />

        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">⏳</div>
              <p className="text-[#6B7280] text-[16px]">
                日記を読み込み中...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">⚠️</div>
              <p className="text-red-600 text-[16px] mb-2">
                エラーが発生しました
              </p>
              <p className="text-[#6B7280] text-[14px]">
                {error}
              </p>
            </div>
          ) : entries.length > 0 ? (
            <div className="box-border content-stretch flex flex-col gap-4 items-start justify-start p-0 relative w-full">
              {entries.map(entry => (
                <AccordionItem
                  key={entry.id}
                  entry={entry}
                  onToggle={handleToggleEntry}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-[#6B7280] text-[16px]">
                この月の日記はまだありません
              </p>
            </div>
          )}
        </div>
      </div>

      <MonthNavigationButtons
        currentMonth={currentMonth}
        hasNextMonth={currentMonthIndex > 0}
        hasPrevMonth={currentMonthIndex < months.length - 1}
        onNextMonth={handleNextMonth}
        onPrevMonth={handlePrevMonth}
      />
    </div>
  );
}