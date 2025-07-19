-- 日記テーブルの作成
CREATE TABLE IF NOT EXISTS diaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  emotion_tag VARCHAR(50) NOT NULL DEFAULT 'neutral',
  keywords JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  is_matched BOOLEAN DEFAULT FALSE,
  anonymous_token VARCHAR(64) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_diaries_created_at ON diaries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_diaries_emotion_tag ON diaries(emotion_tag);
CREATE INDEX IF NOT EXISTS idx_diaries_anonymous_token ON diaries(anonymous_token);
CREATE INDEX IF NOT EXISTS idx_diaries_expires_at ON diaries(expires_at);

-- RLS（Row Level Security）の有効化
ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;

-- 匿名ユーザーが読み書きできるポリシー
CREATE POLICY "Allow anonymous read access" ON diaries
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert" ON diaries
  FOR INSERT WITH CHECK (true);

-- 更新時のタイムスタンプを自動更新するトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_diaries_updated_at
  BEFORE UPDATE ON diaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- サンプルデータの挿入（テスト用）
INSERT INTO diaries (content, emotion_tag, anonymous_token) VALUES
  ('今日は新しいプロジェクトが始まりました。みんなと協力して頑張りたいと思います。', 'happy', 'sample_token_1'),
  ('昨日の疲れが残っていましたが、温かいコーヒーで元気になりました。', 'neutral', 'sample_token_2'),
  ('仕事が忙しくて疲れましたが、達成感もありました。', 'neutral', 'sample_token_3'),
  ('今年一年ありがとうございました。来年もよろしくお願いします。', 'happy', 'sample_token_4'),
  ('年末の大掃除をしました。部屋がすっきりして気持ちいいです。', 'happy', 'sample_token_5'),
  ('友達と会えて楽しかったです。久しぶりに笑いました。', 'happy', 'sample_token_6'),
  ('月末でバタバタしていました。少し疲れ気味です。', 'sad', 'sample_token_7'),
  ('紅葉がきれいでした。散歩していて心が癒されました。', 'happy', 'sample_token_8'),
  ('ハロウィンでした。お菓子をたくさん食べて幸せです。', 'happy', 'sample_token_9'),
  ('秋の空気が心地よかったです。', 'neutral', 'sample_token_10'); 