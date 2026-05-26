'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const login = async () => {
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-white flex flex-col items-center justify-center px-8">
      <div className="w-8 h-8 bg-gray-900 rounded-xl flex items-center justify-center mb-6">
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h1 className="text-lg font-bold text-gray-900 mb-1">管理ページ</h1>
      <p className="text-xs text-gray-400 mb-6">芸ラジ</p>
      <div className="w-full space-y-3">
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && login()}
          className="w-full px-4 py-3 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-colors"
        />
        {error && <p className="text-red-500 text-xs text-center">{error}</p>}
        <button
          onClick={login}
          disabled={!password || loading}
          className="w-full py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl disabled:opacity-40 hover:bg-gray-800 active:bg-black transition-colors"
        >
          {loading ? 'ログイン中...' : 'ログイン'}
        </button>
      </div>
    </div>
  )
}
