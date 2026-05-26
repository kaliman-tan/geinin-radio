import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')
  if (!q?.trim()) return Response.json({ results: [] })

  const res = await fetch(
    `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=podcast&country=JP&limit=15`,
    { next: { revalidate: 3600 } }
  )
  const data = await res.json()

  const results = (data.results ?? []).map((r: Record<string, unknown>) => ({
    title: r.trackName as string,
    creator: r.artistName as string,
    url: r.trackViewUrl as string,
  }))

  return Response.json({ results })
}
