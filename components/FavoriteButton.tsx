'use client'

import { useState, useEffect } from 'react'

interface Props {
  artistId: string
}

export default function FavoriteButton({ artistId }: Props) {
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('geiradio-favorites') || '[]') as string[]
    setIsFavorite(saved.includes(artistId))
  }, [artistId])

  const toggle = () => {
    const saved = JSON.parse(localStorage.getItem('geiradio-favorites') || '[]') as string[]
    const isCurrently = saved.includes(artistId)
    const next = isCurrently ? saved.filter((id) => id !== artistId) : [...saved, artistId]
    localStorage.setItem('geiradio-favorites', JSON.stringify(next))
    setIsFavorite(!isCurrently)
  }

  return (
    <button
      onClick={toggle}
      aria-label={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
      className="p-2 -mr-1 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
    >
      <svg
        className={`w-5 h-5 transition-colors ${
          isFavorite ? 'fill-red-500 stroke-red-500' : 'fill-none stroke-gray-400'
        }`}
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  )
}
