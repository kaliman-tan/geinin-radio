'use client'

import { useState, useEffect } from 'react'
import artistsData from '@/data/artists.json'
import type { Artist } from '@/types'
import ArtistCard from '@/components/ArtistCard'
import BottomNav from '@/components/BottomNav'

const artists = artistsData as Artist[]

export default function FavoritesPage() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('geiradio-favorites') || '[]') as string[]
    setFavoriteIds(saved)
    setMounted(true)
  }, [])

  const favorites = artists.filter((a) => favoriteIds.includes(a.id))

  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-white">
      <header className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 z-10">
        <h1 className="text-xl font-bold text-gray-900">お気に入り</h1>
      </header>

      <main className="pb-24">
        {!mounted ? null : favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-8">
            <svg
              className="w-14 h-14 text-gray-200 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <p className="text-gray-500 text-sm font-medium">まだお気に入りがありません</p>
            <p className="text-gray-400 text-xs mt-1">
              芸人詳細ページのハートアイコンをタップして追加
            </p>
          </div>
        ) : (
          <>
            <p className="px-4 pt-3 pb-1 text-xs text-gray-400">{favorites.length}組</p>
            <ul>
              {favorites.map((artist) => (
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
