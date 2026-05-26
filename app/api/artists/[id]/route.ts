import { redis } from '@/lib/redis'
import { cookies } from 'next/headers'
import type { Artist } from '@/types'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies()
  if (cookieStore.get('admin_token')?.value !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  try {
    const current = await redis.get<Artist[]>('artists') ?? []
    await redis.set('artists', current.filter((a) => a.id !== id))
  } catch {
    return Response.json({ error: 'Redis error' }, { status: 500 })
  }
  return Response.json({ ok: true })
}
