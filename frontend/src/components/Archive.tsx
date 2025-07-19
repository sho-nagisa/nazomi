import React from "react";
import svgPaths from "../../imports/svg-56hwv34ena";
import { useState, useEffect } from "react";
import { DiaryService } from "../services/diaryService";
import { DiaryEntry as SupabaseDiaryEntry } from "../lib/supabase";

interface DiaryEntry {
  id: string;
  date: string;
  content: string;
  emotion: 'happy' | 'neutral' | 'sad';
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
      className={`relative rounded-lg shrink-0 w-full transition-all duration-300 hover:shadow-lg ${
        entry.isExpanded ? 'bg-gradient-to-r from-blue-50 to-purple-50' : 'bg-white'
      }`}
      data-name="Accordion Item"
    >
      <div className={`absolute border ${
        entry.isExpanded ? 'border-[#6366F1]' : 'border-gray-200'
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
                <p className="block leading-[1.4] whitespace-pre-wrap">{entry.content}</p>
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
  // 2024年10月から2027年12月までの月を動的に生成
  const generateMonths = (): string[] => {
    const months: string[] = [];
    for (let year = 2024; year <= 2027; year++) {
      for (let month = 1; month <= 12; month++) {
        // 2024年は10月から開始
        if (year === 2024 && month < 10) continue;
        months.push(`${year}年${month}月`);
      }
    }
    return months;
  };

  const months = generateMonths();
  
  // 現在の月のインデックスを計算
  const getCurrentMonthIndex = (): number => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 0ベースなので+1
    
    // 2024年10月以前の場合は最初の月を返す
    if (currentYear < 2024 || (currentYear === 2024 && currentMonth < 10)) {
      return 0;
    }
    
    // 2027年12月以降の場合は最後の月を返す
    if (currentYear > 2027 || (currentYear === 2027 && currentMonth > 12)) {
      return months.length - 1;
    }
    
    // 現在の月のインデックスを計算
    let index = 0;
    for (let year = 2024; year <= currentYear; year++) {
      for (let month = 1; month <= 12; month++) {
        // 2024年は10月から開始
        if (year === 2024 && month < 10) continue;
        
        if (year === currentYear && month === currentMonth) {
          return index;
        }
        index++;
      }
    }
    
    return 0; // フォールバック
  };
  
  const [currentMonthIndex, setCurrentMonthIndex] = useState(getCurrentMonthIndex());
  const [diaryData, setDiaryData] = useState<Record<string, DiaryEntry[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Supabaseから日記データを取得
  useEffect(() => {
    const fetchDiaryData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 月の配列を年と月に変換（古い順）
        const generateMonthConfigs = (): Array<{ year: number; month: number }> => {
          const configs: Array<{ year: number; month: number }> = [];
          for (let year = 2024; year <= 2027; year++) {
            for (let month = 1; month <= 12; month++) {
              // 2024年は10月から開始
              if (year === 2024 && month < 10) continue;
              configs.push({ year, month });
            }
          }
          return configs;
        };

        const monthConfigs = generateMonthConfigs();

        const monthlyData = await DiaryService.getDiariesByMonths(monthConfigs);
        
        // Supabaseのデータをコンポーネント用の形式に変換
        const convertedData: Record<string, DiaryEntry[]> = {};
        
        monthlyData.forEach(({ month, entries }) => {
          convertedData[month] = entries.map((entry: SupabaseDiaryEntry) => ({
            id: entry.id,
            date: new Date(entry.created_at).toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'numeric',
              day: 'numeric'
            }),
            content: entry.content, // 既に復号化済み
            emotion: mapEmotionTag(entry.emotion_tag),
            isExpanded: false
          }));
        });

        setDiaryData(convertedData);
      } catch (err) {
        console.error('日記データ取得エラー:', err);
        setError('日記データの取得に失敗しました');
        
        // エラー時のフォールバックデータ
        setDiaryData({
          '2025年1月': [
            { id: '1', date: '2025/1/18', content: 'データの取得に失敗しました。', emotion: 'neutral', isExpanded: false },
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDiaryData();
  }, []);

  // 感情タグをコンポーネント用の感情にマッピング
  const mapEmotionTag = (emotionTag: string): 'happy' | 'neutral' | 'sad' => {
    switch (emotionTag) {
      case 'happy':
      case 'excited':
      case 'grateful':
        return 'happy';
      case 'sad':
      case 'angry':
      case 'anxious':
      case 'lonely':
        return 'sad';
      default:
        return 'neutral';
    }
  };

  const currentMonth = months[currentMonthIndex];
  const [entries, setEntries] = useState<DiaryEntry[]>(diaryData[currentMonth] || []);

  // 月が変更されたときにエントリーを更新
  useEffect(() => {
    setEntries(diaryData[currentMonth] || []);
  }, [currentMonth, diaryData]);

  const handleToggleEntry = (id: string) => {
    setEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, isExpanded: !entry.isExpanded } : entry
    ));
  };

  const handleNextMonth = () => {
    if (currentMonthIndex < months.length - 1) {
      const newIndex = currentMonthIndex + 1;
      setCurrentMonthIndex(newIndex);
    }
  };

  const handlePrevMonth = () => {
    if (currentMonthIndex > 0) {
      const newIndex = currentMonthIndex - 1;
      setCurrentMonthIndex(newIndex);
    }
  };

  if (loading) {
    return (
      <div className="relative size-full bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9]">
        <BackButton onClick={onBack} />
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#EC4899] border-t-transparent mb-4 mx-auto"></div>
            <p className="text-[#6B7280]">日記データを読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative size-full bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9]" data-name="日記閲覧画面">
      <BackButton onClick={onBack} />
      
      <div className="px-6 h-full pb-32">
        <MonthHeader month={currentMonth} />
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
          {entries.length > 0 ? (
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
        hasNextMonth={currentMonthIndex < months.length - 1}
        hasPrevMonth={currentMonthIndex > 0}
        onNextMonth={handleNextMonth}
        onPrevMonth={handlePrevMonth}
      />
    </div>
  );
}