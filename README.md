# 匿名日記サービス

匿名で日記を投稿し、共感できる仲間とマッチングしてチャットできるサービスです。

## 機能

### 1. 匿名日記投稿
- ユーザー登録不要の匿名投稿
- 感情タグ付きの日記作成
- 自動キーワード抽出（NLP処理）
- 24時間後の自動削除

### 2. マッチング機能
- 1日3回（朝9時、昼13時、夜20時）の自動マッチング
- 共感ワードの類似度計算（70%以上）
- 同一時間帯（±2時間）での投稿フィルタリング
- 最大5名までのグループマッチング

### 3. チャットルーム機能
- リアルタイムチャット（WebSocket）
- 24時間のルーム有効期限
- メッセージの48時間自動削除
- 匿名トークンによる参加者管理

### 4. 通知機能
- マッチング成功通知
- 新メッセージ通知
- ルーム終了警告通知
- 7日間の通知保持

### 5. セキュリティ機能
- 日記内容の暗号化保存
- 不適切な内容のフィルタリング
- 匿名トークンによる識別
- 自動データ削除

## 技術スタック

### バックエンド
- **FastAPI**: Webフレームワーク
- **SQLAlchemy**: ORM
- **PostgreSQL**: データベース
- **spaCy + SudachiPy**: 日本語NLP処理
- **Socket.io**: リアルタイム通信
- **APScheduler**: スケジューラー
- **Cryptography**: 暗号化

### フロントエンド
- **React**: UIフレームワーク
- **Vite**: ビルドツール
- **Socket.io-client**: リアルタイム通信

## セットアップ

### 1. 環境変数の設定

`.env`ファイルを作成：

```env
# データベース設定
DATABASE_URL=postgresql://username:password@localhost:5432/diary_db

# 暗号化設定
ENCRYPTION_KEY=your-32-byte-encryption-key

# JWT設定
JWT_SECRET=your-jwt-secret-key

# その他の設定
DEBUG=True
LOG_LEVEL=INFO
```

### 2. バックエンドのセットアップ

```bash
cd backend

# 依存関係のインストール
pip install -r requirements.txt

# spaCyモデルのダウンロード
python -m spacy download ja_core_news_sm

# データベース初期化
python -m app.db.init_db

# アプリケーション起動
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. フロントエンドのセットアップ

```bash
cd frontend

# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev
```

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

## データベーススキーマ

### テーブル構成
- `diaries` - 日記テーブル
- `chat_rooms` - チャットルームテーブル
- `chat_messages` - チャットメッセージテーブル
- `notifications` - 通知テーブル

### 主要なフィールド
- 暗号化されたコンテンツ
- 匿名トークン
- 有効期限（expires_at）
- 自動削除フラグ

## スケジューラー機能

### 自動実行タスク
- **マッチング処理**: 朝9時、昼13時、夜20時
- **ルーム終了警告**: 毎時0分
- **クリーンアップ処理**: 毎時30分
- **日記クリーンアップ**: 毎日午前2時

### 手動実行
```bash
# 手動マッチング実行
curl -X POST http://localhost:8000/api/matching/run

# 手動クリーンアップ実行
curl -X POST http://localhost:8000/api/cleanup/run
```

## セキュリティ

### 匿名性の確保
- ユーザー登録不要
- Cookieベースの匿名トークン
- 個人情報の非収集

### データ保護
- 日記内容の暗号化
- 自動削除機能
- 不適切な内容のフィルタリング

### アクセス制御
- 匿名トークンによる認証
- ルーム参加権限チェック
- メッセージ送信権限チェック

## 開発・運用

### ログ管理
- 構造化ログ出力
- エラーログの詳細記録
- 不適切な内容の検出ログ

### 監視
- データベース接続状態
- スケジューラー実行状況
- API応答時間

### バックアップ
- 定期的なデータベースバックアップ
- 設定ファイルのバージョン管理

## ライセンス

MIT License