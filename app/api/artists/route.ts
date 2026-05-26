import { redis } from '@/lib/redis'
import { cookies } from 'next/headers'
import type { Artist } from '@/types'

async function isAuthed(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get('admin_token')?.value === process.env.ADMIN_PASSWORD
}

export async function GET() {
  try {
    const artists = await redis.get<Artist[]>('artists') ?? []
    return Response.json(artists)
  } catch {
    return Response.json([])
  }
}

export async function POST(request: Request) {
  if (!(await isAuthed())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const artist = await request.json() as Artist
  try {
    const current = await redis.get<Artist[]>('artists') ?? []
    await redis.set('artists', [artist, ...current])
  } catch {
    return Response.json({ error: 'Redis error' }, { status: 500 })
  }
  return Response.json({ ok: true })
}
