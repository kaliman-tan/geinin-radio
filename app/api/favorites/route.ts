import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { pool } from '@/lib/db'
import { artistIdSchema } from '@/lib/validations'
import { apiRatelimit } from '@/lib/rate-limit'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { success } = await apiRatelimit.limit(session.user.id)
  if (!success) return Response.json({ error: 'Too many requests' }, { status: 429 })

  const result = await pool.query(
    'SELECT artist_id FROM favorites WHERE user_id = $1',
    [session.user.id]
  )
  const favorites = (result.rows as { artist_id: string }[]).map((r) => r.artist_id)
  return Response.json({ favorites })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { success } = await apiRatelimit.limit(session.user.id)
  if (!success) return Response.json({ error: 'Too many requests' }, { status: 429 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: '不正なリクエストです' }, { status: 400 })
  }

  const parsed = artistIdSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  await pool.query(
    'INSERT INTO favorites (user_id, artist_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [session.user.id, parsed.data.artistId]
  )
  return Response.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { success } = await apiRatelimit.limit(session.user.id)
  if (!success) return Response.json({ error: 'Too many requests' }, { status: 429 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: '不正なリクエストです' }, { status: 400 })
  }

  const parsed = artistIdSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  await pool.query(
    'DELETE FROM favorites WHERE user_id = $1 AND artist_id = $2',
    [session.user.id, parsed.data.artistId]
  )
  return Response.json({ ok: true })
}
