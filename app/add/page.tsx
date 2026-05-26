'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Artist } from '@/types'
import BottomNav from '@/components/BottomNav'

interface PodcastResult {
  title: string
  creator: string
  url: string
}

function generateId(name: string): string {
  return name.replace(/\s+/g, '-').replace(/[^\w぀-ゟ゠-ヿ一-龯-]/g, '') + '-' + Date.now().toString(36)
}

export default function AddArtistPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [members, setMembers] = useState('')
  const [results, setResults] = useState<PodcastResult[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const search = async () => {
    if (!name.trim()) return
    setLoading(true)
    setSearched(false)
    setResults([])
    setSelected(new Set())
    try {
      const res = await fetch(`/api/podcast-search?q=${encodeURIComponent(name)}`)
      const data = await res.json()
      setResults(data.results)
    } finally {
      setLoading(false)
      setSearched(true)
    }
  }

  const toggleSelect = (i: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const save = () => {
    const programs = [...selected].map((i) => ({
      title: results[i].title,
      platform: 'apple_podcast' as const,
      url: results[i].url,
      frequency: '不定期',
    }))

    const artist: Artist = {
      id: generateId(name),
      name: name.trim(),
      members: members.split(/[、,，\s]+/).map((m) => m.trim()).filter(Boolean),
      programs,
    }

    const saved = JSON.parse(localStorage.getItem('geiradio-custom-artists') || '[]') as Artist[]
    localStorage.setItem('geiradio-custom-artists', JSON.stringify([...saved, artist]))
    router.push('/')
  }

  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-white">
      <header className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-2 z-10">
        <Link
          href="/"
          className="p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="font-bold text-gray-900">芸人を追加</h1>
      </header>

      <main className="px-4 pt-4 pb-24 space-y-4">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 font-medium">芸人名（必須）</label>
            <input
              type="text"
              placeholder="例：霜降り明星"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && search()}
              className="mt-1 w-full px-3 py-2.5 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium">メンバー（任意・読点区切り）</label>
            <input
              type="text"
              placeholder="例：せいや、粗品"
              value={members}
              onChange={(e) => setMembers(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
            />
          </div>
          <button
            onClick={search}
            disabled={!name.trim() || loading}
            className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl disabled:opacity-40 hover:bg-blue-700 active:bg-blue-800 transition-colors"
          >
            {loading ? '検索中...' : 'Apple Podcastで検索'}
          </button>
        </div>

        {searched && (
          <div>
            {results.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">番組が見つかりませんでした</p>
            ) : (
              <>
                <p className="text-xs text-gray-400 mb-2">
                  {results.length}件見つかりました。追加する番組を選んでください
                </p>
                <ul className="space-y-2">
                  {results.map((r, i) => (
                    <li
                      key={i}
                      onClick={() => toggleSelect(i)}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        selected.has(i)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div
                        className={`mt-0.5 w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${
                          selected.has(i) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                        }`}
                      >
                        {selected.has(i) && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{r.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{r.creator} · Apple Podcast</p>
                      </div>
                    </li>
                  ))}
                </ul>
                {selected.size > 0 && (
                  <button
                    onClick={save}
                    className="mt-4 w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors"
                  >
                    {selected.size}番組を選択して追加
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
