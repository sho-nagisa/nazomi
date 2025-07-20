# テストガイド

このディレクトリには、匿名日記サービスのバックエンドの包括的なテストスイートが含まれています。

## テスト構成

### テストファイル一覧

- `conftest.py` - テスト設定とフィクスチャ
- `test_models.py` - データベースモデルのテスト
- `test_crud.py` - CRUD操作のテスト
- `test_services.py` - サービスクラスのテスト
- `test_api.py` - APIエンドポイントのテスト
- `test_security.py` - セキュリティ機能のテスト

### テストカテゴリ

1. **モデルテスト** (`test_models.py`)
   - データベースモデルの作成・検証
   - 有効期限の設定確認
   - 匿名トークン生成のテスト

2. **CRUDテスト** (`test_crud.py`)
   - 日記の作成・取得・更新・削除
   - チャットルーム・メッセージの操作
   - 通知の管理
   - 期限切れデータのクリーンアップ

3. **サービステスト** (`test_services.py`)
   - マッチングサービスの機能
   - チャットサービスの機能
   - 通知サービスの機能

4. **APIテスト** (`test_api.py`)
   - 各APIエンドポイントの動作確認
   - リクエスト・レスポンスの検証
   - エラーハンドリングの確認

5. **セキュリティテスト** (`test_security.py`)
   - 匿名トークンの生成・検証
   - コンテンツフィルタリング
   - テキストサニタイズ
   - 暗号化・復号化

## テスト実行方法

### 基本的なテスト実行

```bash
# 全テストを実行
pytest

# 詳細な出力で実行
pytest -v

# 特定のテストファイルを実行
pytest test_models.py

# 特定のテストクラスを実行
pytest test_models.py::TestDiaryModel

# 特定のテストメソッドを実行
pytest test_models.py::TestDiaryModel::test_create_diary
```

### カテゴリ別テスト実行

```bash
# モデルテストのみ実行
pytest -m "unit"

# APIテストのみ実行
pytest -m "api"

# セキュリティテストのみ実行
pytest -m "security"

# 統合テストのみ実行
pytest -m "integration"
```

### カバレッジレポート生成

```bash
# カバレッジ付きでテスト実行
pytest --cov=app --cov-report=html

# HTMLレポートを生成（htmlcov/index.htmlで確認可能）
pytest --cov=app --cov-report=html:htmlcov

# ターミナルでカバレッジ表示
pytest --cov=app --cov-report=term-missing
```

### 並列実行

```bash
# 並列でテスト実行（高速化）
pytest -n auto

# 4つのワーカーで並列実行
pytest -n 4
```

## テストデータベース

テストでは、SQLiteのインメモリデータベースを使用しています：

- テスト用データベース: `sqlite:///./test.db`
- 各テスト実行時にテーブルが作成・削除される
- 実際のデータベースに影響しない

## フィクスチャ

### 利用可能なフィクスチャ

- `client` - FastAPIテストクライアント
- `db_session` - テスト用データベースセッション
- `sample_diary_data` - サンプル日記データ
- `sample_chat_message_data` - サンプルチャットメッセージデータ
- `sample_notification_data` - サンプル通知データ

### フィクスチャの使用例

```python
def test_create_diary_with_fixture(client, sample_diary_data):
    response = client.post("/api/diary", json=sample_diary_data)
    assert response.status_code == 200
```

## テストの書き方ガイドライン

### テストメソッドの命名

```python
def test_機能名_条件_期待結果(self):
    """テストの説明"""
    # テストコード
```

### アサーションの例

```python
# 基本的なアサーション
assert response.status_code == 200
assert data["key"] == "expected_value"
assert len(items) == 3

# 例外のテスト
with pytest.raises(ValueError):
    function_that_raises_error()

# 非同期テスト
@pytest.mark.asyncio
async def test_async_function():
    result = await async_function()
    assert result == expected_value
```

### テストデータの準備

```python
def test_with_test_data(self, db_session):
    # テストデータを作成
    test_item = Model(
        field1="value1",
        field2="value2"
    )
    db_session.add(test_item)
    db_session.commit()
    
    # テスト実行
    result = function_under_test(test_item.id)
    assert result is not None
```

## トラブルシューティング

### よくある問題

1. **データベース接続エラー**
   ```bash
   # テスト用データベースファイルを削除
   rm test.db
   ```

2. **依存関係エラー**
   ```bash
   # 依存関係を再インストール
   pip install -r requirements.txt
   ```

3. **テストが遅い**
   ```bash
   # 並列実行を使用
   pytest -n auto
   ```

### デバッグ

```bash
# 詳細なログ出力
pytest -v -s

# 特定のテストでブレークポイント
pytest -x --pdb

# 失敗したテストのみ再実行
pytest --lf
```

## CI/CD統合

### GitHub Actions例

```yaml
- name: Run tests
  run: |
    cd backend
    pytest --cov=app --cov-report=xml
```

### カバレッジ閾値設定

```bash
# カバレッジが80%未満の場合にテスト失敗
pytest --cov=app --cov-fail-under=80
```

## パフォーマンステスト

```bash
# 遅いテストをスキップ
pytest -m "not slow"

# パフォーマンステストのみ実行
pytest -m "slow"
```

## セキュリティテスト

```bash
# セキュリティテストのみ実行
pytest -m "security"

# セキュリティテストと統合テスト
pytest -m "security or integration"
```

このテストスイートにより、匿名日記サービスの品質と信頼性を確保できます。 