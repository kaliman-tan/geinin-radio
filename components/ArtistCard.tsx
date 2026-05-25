import Link from 'next/link'
import type { Artist, Platform } from '@/types'
import InitialAvatar from './InitialAvatar'
import PlatformBadge from './PlatformBadge'

interface Props {
  artist: Artist
}

export default function ArtistCard({ artist }: Props) {
  const platforms = Array.from(new Set(artist.programs.map((p) => p.platform as Platform)))

  return (
    <Link
      href={`/artist/${artist.id}`}
      className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors"
    >
      <InitialAvatar name={artist.name} />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900">{artist.name}</div>
        <div className="text-xs text-gray-500 mt-0.5 truncate">
          {artist.programs.length}番組
          {artist.members.length > 0 && ` · ${artist.members.join('・')}`}
        </div>
        <div className="flex gap-1 mt-1.5 flex-wrap">
          {platforms.map((platform) => (
            <PlatformBadge key={platform} platform={platform} />
          ))}
        </div>
      </div>
      <svg
        className="w-4 h-4 text-gray-300 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}
