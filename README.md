# Mental Care Diary App

匿名日記サービス - 自然言語処理を使った匿名日記マッチングサービス

## セットアップ

### 1. 環境変数の設定

#### フロントエンド（Supabase設定）
`frontend/.env` ファイルを作成し、以下の内容を設定してください：

```env
# Supabase設定
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

#### バックエンド
`backend/.env` ファイルを作成し、以下の内容を設定してください：

```env
# データベース設定
DATABASE_URL=your_database_url_here

# 暗号化設定
ENCRYPTION_KEY=your_32_byte_encryption_key_here

# JWT設定
JWT_SECRET=your_jwt_secret_here

# ログ設定
LOG_LEVEL=INFO
```

### 2. Supabaseのセットアップ

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. プロジェクトの設定からURLとAnon Keyを取得
3. SQL Editorで `supabase-schema.sql` の内容を実行してテーブルを作成

### 3. フロントエンドのセットアップ

```bash
cd frontend

# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev
```

### 4. バックエンドのセットアップ

```bash
cd backend

# 依存関係のインストール
pip install -r requirements.txt

# spaCyモデルのダウンロード
python -m spacy download ja_core_news_sm

# アプリケーション起動
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 機能

### 日記機能
- **匿名日記投稿**: 感情タグ付きで日記を投稿
- **日記閲覧**: 月別に日記を閲覧
- **感情分析**: 投稿内容から感情を自動分析
- **キーワード抽出**: NLPによるキーワード抽出

### マッチング機能
- **共感ワード表示**: 同じキーワードを持つユーザーを表示
- **自動マッチング**: スケジューラーによる定期マッチング
- **手動マッチング**: 管理者による手動マッチング実行

### チャット機能
- **匿名チャット**: マッチしたユーザーとの匿名チャット
- **リアルタイム通信**: WebSocketによるリアルタイムメッセージ
- **ルーム管理**: チャットルームの作成・管理

### 通知機能
- **マッチング通知**: 新しいマッチングの通知
- **メッセージ通知**: 新しいメッセージの通知
- **未読管理**: 未読通知の管理

## データベーススキーマ

### diaries テーブル
- `id`: UUID (主キー)
- `content`: TEXT (日記内容)
- `emotion_tag`: VARCHAR(50) (感情タグ)
- `keywords`: JSONB (キーワード配列)
- `created_at`: TIMESTAMP (作成日時)
- `expires_at`: TIMESTAMP (有効期限)
- `is_matched`: BOOLEAN (マッチング済みフラグ)
- `anonymous_token`: VARCHAR(64) (匿名トークン)

## API エンドポイント

### 日記関連
- `POST /api/diary` - 日記投稿
- `GET /api/diary/{diary_id}` - 日記取得
- `GET /api/diaries` - 日記一覧
- `GET /api/my-diaries` - 自分の日記一覧

### マッチング関連
- `GET /api/empathy-words` - 今日の共感ワード
- `POST /api/matching/run` - 手動マッチング実行
- `GET /api/matching/status` - マッチング状態

### チャット関連
- `GET /api/chat-rooms` - チャットルーム一覧
- `GET /api/chat-rooms/{room_id}` - ルーム情報
- `GET /api/chat-rooms/{room_id}/messages` - メッセージ取得
- `POST /api/chat-rooms/{room_id}/messages` - メッセージ送信
- `WS /api/ws/chat/{room_id}` - WebSocket接続

### 通知関連
- `GET /api/notifications` - 通知一覧
- `GET /api/notifications/unread-count` - 未読数
- `PUT /api/notifications/{id}/read` - 既読設定
- `PUT /api/notifications/read-all` - 全既読

## スケジューラー機能

### 自動実行タスク
- **マッチング処理**: 朝9時、昼13時、夜20時に実行
- **ルーム終了警告**: 毎時0分にチェック
- **クリーンアップ処理**: 毎時30分に実行
- **日記クリーンアップ**: 毎日午前2時に実行

## 開発

### フロントエンド
- React + TypeScript + Vite
- Tailwind CSS
- Supabase Client

### バックエンド
- FastAPI + Python
- SQLAlchemy + PostgreSQL
- spaCy (自然言語処理)
- APScheduler (スケジューラー)

### デバッグ
- フロントエンド: http://localhost:5173
- バックエンド: http://localhost:8000
- API ドキュメント: http://localhost:8000/docs

## ライセンス

MIT License