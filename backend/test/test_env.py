#!/usr/bin/env python3
"""
環境変数の読み込みテストスクリプト
"""

import os
import sys
from dotenv import load_dotenv

def test_env_loading():
    """環境変数の読み込みをテスト"""
    print("=== 環境変数読み込みテスト ===")
    
    # 1. 直接os.environから読み込み
    print("\n1. os.environからの読み込み:")
    env_vars = [
        'SUPABASE_SERVICE_ROLE_KEY',
        'DATABASE_URL',
        'JWT_SECRET',
        'ENCRYPTION_KEY'
    ]
    
    for var in env_vars:
        value = os.environ.get(var)
        if value:
            # 機密情報は最初の10文字のみ表示
            display_value = value[:10] + "..." if len(value) > 10 else value
            print(f"  ✅ {var}: {display_value}")
        else:
            print(f"  ❌ {var}: 未設定")
    
    # 2. python-dotenvで.envファイルを読み込み
    print("\n2. python-dotenvでの読み込み:")
    load_dotenv()
    
    for var in env_vars:
        value = os.environ.get(var)
        if value:
            display_value = value[:10] + "..." if len(value) > 10 else value
            print(f"  ✅ {var}: {display_value}")
        else:
            print(f"  ❌ {var}: 未設定")
    
    # 3. Pydantic Settingsでの読み込み
    print("\n3. Pydantic Settingsでの読み込み:")
    try:
        # プロジェクトルートをパスに追加
        sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        
        from app.core.config import settings
        
        print(f"  ✅ SUPABASE_URL: {settings.SUPABASE_URL}")
        print(f"  ✅ SUPABASE_SERVICE_ROLE_KEY: {settings.SUPABASE_SERVICE_ROLE_KEY[:10]}...")
        print(f"  ✅ DATABASE_URL: {settings.DATABASE_URL[:50]}..." if settings.DATABASE_URL else "  ❌ DATABASE_URL: 未設定")
        print(f"  ✅ ENCRYPTION_KEY: {settings.ENCRYPTION_KEY[:10]}..." if settings.ENCRYPTION_KEY else "  ❌ ENCRYPTION_KEY: 未設定")
        
    except Exception as e:
        print(f"  ❌ Pydantic Settings読み込みエラー: {e}")
        import traceback
        traceback.print_exc()
    
    # 4. .envファイルの存在確認
    print("\n4. .envファイルの存在確認:")
    env_file_path = os.path.join(os.getcwd(), '.env')
    if os.path.exists(env_file_path):
        print(f"  ✅ .envファイルが見つかりました: {env_file_path}")
        
        # ファイルサイズを確認
        file_size = os.path.getsize(env_file_path)
        print(f"  📁 ファイルサイズ: {file_size} bytes")
        
        # 最初の数行を表示
        with open(env_file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()[:3]
            print("  📄 ファイル内容（最初の3行）:")
            for line in lines:
                print(f"    {line.strip()}")
    else:
        print(f"  ❌ .envファイルが見つかりません: {env_file_path}")

if __name__ == "__main__":
    test_env_loading() 