import type { Platform } from '@/types'

const platformConfig: Record<Platform, { label: string; className: string }> = {
  youtube: { label: 'YT', className: 'bg-red-600 text-white' },
  spotify: { label: 'SP', className: 'bg-green-600 text-white' },
  apple_podcast: { label: 'AP', className: 'bg-purple-600 text-white' },
  gera: { label: 'GE', className: 'bg-orange-500 text-white' },
  radiko: { label: 'RK', className: 'bg-blue-600 text-white' },
  other: { label: 'OT', className: 'bg-gray-500 text-white' },
}

export const platformDisplayName: Record<Platform, string> = {
  youtube: 'YouTube',
  spotify: 'Spotify',
  apple_podcast: 'Apple Podcast',
  gera: 'GERA',
  radiko: 'radiko',
  other: 'その他',
}

interface Props {
  platform: Platform
}

export default function PlatformBadge({ platform }: Props) {
  const config = platformConfig[platform] ?? platformConfig.other
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold ${config.className}`}
    >
      {config.label}
    </span>
  )
}
