import { notFound } from 'next/navigation'
import Link from 'next/link'
import artistsData from '@/data/artists.json'
import type { Artist, Platform } from '@/types'
import InitialAvatar from '@/components/InitialAvatar'
import PlatformBadge, { platformDisplayName } from '@/components/PlatformBadge'
import FavoriteButton from '@/components/FavoriteButton'

const artists = artistsData as Artist[]

export function generateStaticParams() {
  return artists.map((a) => ({ id: a.id }))
}

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const artist = artists.find((a) => a.id === id)

  if (!artist) notFound()

  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-white">
      <header className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-2 z-10">
        <Link
          href="/"
          className="p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-gray-900 truncate">{artist.name}</h1>
          {artist.members.length > 0 && (
            <p className="text-xs text-gray-500 truncate">{artist.members.join('・')}</p>
          )}
        </div>
        <FavoriteButton artistId={artist.id} />
      </header>

      <main className="pb-8">
        <div className="px-4 pt-3 pb-2">
          <InitialAvatar name={artist.name} size="lg" />
          <h2 className="mt-2 text-lg font-bold text-gray-900">{artist.name}</h2>
          {artist.members.length > 0 && (
            <p className="text-sm text-gray-500">{artist.members.join(' · ')}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">{artist.programs.length}番組</p>
        </div>

        <ul className="mt-2">
          {artist.programs.map((program, i) => (
            <li
              key={i}
              className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100"
            >
              <PlatformBadge platform={program.platform as Platform} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {program.title}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {platformDisplayName[program.platform as Platform]} · {program.frequency}
                </div>
              </div>
              <a
                href={program.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors"
              >
                開く
              </a>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
