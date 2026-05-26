import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')
  if (!q?.trim()) return Response.json({ results: [] })

  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) return Response.json({ results: [], error: 'YOUTUBE_API_KEY未設定' })

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?q=${encodeURIComponent(q)}&type=channel&part=snippet&maxResults=10&key=${apiKey}`,
    { next: { revalidate: 3600 } }
  )
  const data = await res.json()

  if (!data.items) return Response.json({ results: [] })

  const results = data.items.map((item: Record<string, unknown>) => {
    const snippet = item.snippet as Record<string, unknown>
    const id = item.id as Record<string, unknown>
    return {
      title: snippet.title as string,
      creator: snippet.description as string,
      url: `https://www.youtube.com/channel/${id.channelId}`,
    }
  })

  return Response.json({ results })
}
