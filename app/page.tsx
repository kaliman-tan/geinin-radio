'use client'

import { useState, useMemo } from 'react'
import artistsData from '@/data/artists.json'
import type { Artist } from '@/types'
import ArtistCard from '@/components/ArtistCard'
import BottomNav from '@/components/BottomNav'

const artists = artistsData as Artist[]

export default function HomePage() {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return artists
    const q = query.toLowerCase()
    return artists.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.members.some((m) => m.toLowerCase().includes(q))
    )
  }, [query])

  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-white">
      <header className="sticky top-0 bg-white border-b border-gray-100 px-4 pt-4 pb-3 z-10">
        <h1 className="text-xl font-bold text-gray-900 mb-3">芸ラジ</h1>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="芸人名で検索..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </header>

      <main className="pb-24">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <p className="text-gray-500 text-sm">
              「{query}」に一致する芸人が見つかりません
            </p>
          </div>
        ) : (
          <>
            <p className="px-4 pt-3 pb-1 text-xs text-gray-400">{filtered.length}組</p>
            <ul>
              {filtered.map((artist) => (
                <li key={artist.id}>
                  <ArtistCard artist={artist} />
                </li>
              ))}
            </ul>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
