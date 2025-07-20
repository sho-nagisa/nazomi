import { useState, useEffect } from 'react'
import { diaryApi } from '../lib/supabaseApi'

export default function TokenDebug() {
  const [token, setToken] = useState<string>('')
  const [diaries, setDiaries] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Cookieからトークンを取得
    const tokenFromCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('anonymous_token='))
      ?.split('=')[1] || 'トークンが見つかりません'
    
    setToken(tokenFromCookie)
  }, [])

  const testGetDiaries = async () => {
    setIsLoading(true)
    try {
      const result = await diaryApi.getMyDiaries()
      setDiaries(result)
    } catch (error) {
      console.error('日記取得エラー:', error)
      setDiaries([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed top-4 left-4 z-50 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-md">
      <h3 className="font-bold text-gray-800 mb-2">匿名トークンデバッグ</h3>
      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium">現在のトークン:</span>
          <div className="text-gray-600 break-all text-xs">{token}</div>
        </div>
        <button
          onClick={testGetDiaries}
          disabled={isLoading}
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? '取得中...' : '自分の日記を取得'}
        </button>
        <div>
          <span className="font-medium">取得した日記数:</span>
          <div className="text-gray-600">{diaries.length}件</div>
        </div>
        {diaries.length > 0 && (
          <div>
            <span className="font-medium">最新の日記:</span>
            <div className="text-gray-600 text-xs">
              {diaries[0]?.content?.substring(0, 50)}...
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 