import { useState } from 'react'

export default function DebugInfo() {
  const [isVisible, setIsVisible] = useState(false)

  const debugInfo = {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? '設定済み' : '未設定',
    nodeEnv: import.meta.env.MODE,
    baseUrl: import.meta.env.BASE_URL
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-700"
      >
        {isVisible ? 'デバッグ情報を隠す' : 'デバッグ情報を表示'}
      </button>
      
      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-md">
          <h3 className="font-bold text-gray-800 mb-2">デバッグ情報</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Supabase URL:</span>
              <div className="text-gray-600 break-all">
                {debugInfo.supabaseUrl || '未設定'}
              </div>
            </div>
            <div>
              <span className="font-medium">Supabase Anon Key:</span>
              <div className="text-gray-600">
                {debugInfo.supabaseAnonKey}
              </div>
            </div>
            <div>
              <span className="font-medium">環境:</span>
              <div className="text-gray-600">{debugInfo.nodeEnv}</div>
            </div>
            <div>
              <span className="font-medium">Base URL:</span>
              <div className="text-gray-600">{debugInfo.baseUrl}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 