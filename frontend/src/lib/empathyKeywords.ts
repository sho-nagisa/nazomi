// 共感ワード抽出サービス

// 感情カテゴリ別の共感ワード辞書
const empathyKeywords = {
  // ポジティブな感情
  happy: [
    '嬉しい', '楽しい', '幸せ', '喜び', '感動', '感激', '興奮', 'ワクワク', 'ドキドキ',
    '充実', '満足', '達成感', 'やりがい', '希望', '期待', '夢', '目標', '成功',
    '感謝', 'ありがとう', '愛', '優しさ', '温かさ', '安心', 'リラックス', '癒し'
  ],
  
  // ネガティブな感情
  sad: [
    '悲しい', '辛い', '苦しい', '痛い', '寂しい', '孤独', '不安', '心配', '恐怖',
    '怒り', 'イライラ', 'ストレス', '疲れ', '疲労', '倦怠感', '無気力', '絶望',
    '後悔', '罪悪感', '恥ずかしい', '恥', '恥辱', '屈辱', '挫折', '失敗', '落ち込み'
  ],
  
  // 中性的な感情
  neutral: [
    '普通', '日常', '平凡', '穏やか', '静か', '落ち着き', '冷静', '客観的',
    '考え', '思う', '感じる', '気づく', '理解', '認識', '意識', '自覚',
    '変化', '成長', '学習', '経験', '記憶', '思い出', '過去', '現在', '未来'
  ],
  
  // 社会的な感情
  social: [
    '友達', '家族', '仲間', '同僚', '上司', '部下', '恋人', '結婚', '離婚',
    'コミュニケーション', '会話', '相談', 'アドバイス', 'サポート', '協力',
    '競争', '比較', '評価', '承認', '認められる', '理解される', '受け入れられる'
  ],
  
  // 身体的・環境的な感情
  physical: [
    '健康', '病気', '怪我', '痛み', '疲労', '睡眠', '食事', '運動', '休息',
    '天気', '季節', '気候', '温度', '湿度', '環境', '場所', '空間', '時間'
  ]
};

// 共感ワードの重み付け
const keywordWeights = {
  happy: 1.0,
  sad: 1.0,
  neutral: 0.5,
  social: 0.8,
  physical: 0.6
};

// 日記テキストから共感ワードを抽出
export function extractEmpathyKeywords(text: string): {
  keywords: string[];
  categories: Record<string, number>;
  topKeywords: string[];
} {
  const words = text.toLowerCase();
  const foundKeywords: string[] = [];
  const categoryCounts: Record<string, number> = {};
  
  // 各カテゴリのキーワードをチェック
  Object.entries(empathyKeywords).forEach(([category, keywords]) => {
    categoryCounts[category] = 0;
    
    keywords.forEach(keyword => {
      if (words.includes(keyword.toLowerCase())) {
        foundKeywords.push(keyword);
        categoryCounts[category]++;
      }
    });
  });
  
  // 重み付けされたスコアを計算
  const weightedScores: Record<string, number> = {};
  Object.entries(categoryCounts).forEach(([category, count]) => {
    weightedScores[category] = count * (keywordWeights[category as keyof typeof keywordWeights] || 1.0);
  });
  
  // 上位キーワードを選択（重複を除去）
  const uniqueKeywords = [...new Set(foundKeywords)];
  const topKeywords = uniqueKeywords.slice(0, 5); // 最大5個
  
  return {
    keywords: uniqueKeywords,
    categories: weightedScores,
    topKeywords
  };
}

// 感情タグから共感ワードのカテゴリを推測
export function getEmpathyCategoryFromEmotion(emotionTag: string): string {
  const emotionMap: Record<string, string> = {
    'happy': 'happy',
    'excited': 'happy',
    'gratitude': 'happy',
    'calm': 'neutral',
    'angry': 'sad',
    'sad': 'sad',
    'embarrassed': 'sad',
    'alone': 'sad',
    'neutral': 'neutral'
  };
  
  return emotionMap[emotionTag] || 'neutral';
}

// 共感ワードの日本語カテゴリ名
export const categoryNames = {
  happy: 'ポジティブ',
  sad: 'ネガティブ',
  neutral: '中性的',
  social: '社会的',
  physical: '身体的'
};

// 共感ワードの説明
export function getEmpathyDescription(keywords: string[], categories: Record<string, number>): string {
  const topCategory = Object.entries(categories)
    .sort(([,a], [,b]) => b - a)[0];
  
  if (!topCategory || topCategory[1] === 0) {
    return '共感ワードが見つかりませんでした。';
  }
  
  const descriptions = {
    happy: 'ポジティブな感情が多く見られます。充実した時間を過ごされているようですね。',
    sad: 'ネガティブな感情が多く見られます。辛い時期かもしれませんが、無理をしすぎないでください。',
    neutral: '落ち着いた感情が多く見られます。日常の穏やかな時間を大切にされていますね。',
    social: '人との関わりに関する感情が多く見られます。周囲との関係性を大切にされていますね。',
    physical: '身体的な感覚や環境に関する感情が多く見られます。体調管理に気を配られていますね。'
  };
  
  return descriptions[topCategory[0] as keyof typeof descriptions] || '感情の傾向を分析しました。';
} 