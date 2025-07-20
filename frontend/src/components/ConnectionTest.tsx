import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function ConnectionTest() {
  const [testResult, setTestResult] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const testConnection = async () => {
    setIsLoading(true)
    setTestResult('接続テスト中...')
    
    try {
      // 基本的な接続テスト（diariesテーブルを使用）
      const { data, error } = await supabase
        .from('diaries')
        .select('count')
        .limit(1)
      
      if (error) {
        setTestResult(`エラー: ${error.message}`)
      } else {
        setTestResult(`成功: データベースに接続できました。diariesテーブルにアクセス可能です。`)
      }
    } catch (err) {
      setTestResult(`接続エラー: ${err instanceof Error ? err.message : '不明なエラー'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testDiariesTable = async () => {
    setIsLoading(true)
    setTestResult('diariesテーブルテスト中...')
    
    try {
      const { data, error } = await supabase
        .from('diaries')
        .select('count')
        .limit(1)
      
      if (error) {
        setTestResult(`diariesテーブルエラー: ${error.message}`)
      } else {
        setTestResult(`diariesテーブル成功: テーブルにアクセスできました`)
      }
    } catch (err) {
      setTestResult(`diariesテーブル接続エラー: ${err instanceof Error ? err.message : '不明なエラー'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed top-4 left-4 z-50 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-md">
      <h3 className="font-bold text-gray-800 mb-2">Supabase接続テスト</h3>
      <div className="space-y-2">
        <button
          onClick={testConnection}
          disabled={isLoading}
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
        >
          基本接続テスト
        </button>
        <button
          onClick={testDiariesTable}
          disabled={isLoading}
          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 disabled:opacity-50 ml-2"
        >
          diariesテーブルテスト
        </button>
        <div className="text-sm text-gray-600 mt-2">
          {testResult}
        </div>
      </div>
    </div>
  )
} 