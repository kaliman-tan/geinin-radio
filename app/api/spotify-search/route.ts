import { NextRequest } from 'next/server'

async function getAccessToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID!
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
    },
    body: 'grant_type=client_credentials',
  })
  const data = await res.json()
  return data.access_token
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')
  if (!q?.trim()) return Response.json({ results: [] })

  if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
    return Response.json({ results: [], error: 'Spotify APIキー未設定' })
  }

  try {
    const token = await getAccessToken()
    const res = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=show&market=JP&limit=10`,
      { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 3600 } }
    )
    const data = await res.json()
    const results = (data.shows?.items ?? []).map((item: Record<string, unknown>) => ({
      title: item.name as string,
      creator: item.publisher as string,
      url: (item.external_urls as Record<string, string>).spotify,
    }))
    return Response.json({ results })
  } catch {
    return Response.json({ results: [] })
  }
}
