'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  artistId: string
}

export default function FavoriteButton({ artistId }: Props) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/favorites')
      .then(async (res) => {
        if (!res.ok) return { favorites: [] as string[] }
        return res.json() as Promise<{ favorites: string[] }>
      })
      .then((data) => {
        setIsFavorite(data.favorites.includes(artistId))
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [artistId])

  const toggle = async () => {
    if (!loaded) return

    const method = isFavorite ? 'DELETE' : 'POST'
    const res = await fetch('/api/favorites', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ artistId }),
    })

    if (res.status === 401) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`)
      return
    }

    if (res.ok) {
      setIsFavorite(!isFavorite)
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
      className="p-2 -mr-1 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
    >
      <svg
        className={`w-5 h-5 transition-colors ${
          loaded
            ? isFavorite
              ? 'fill-red-500 stroke-red-500'
              : 'fill-none stroke-gray-400'
            : 'fill-none stroke-gray-200'
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
