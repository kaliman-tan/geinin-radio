import { kv } from '@vercel/kv'
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
    const current = await kv.get<Artist[]>('artists') ?? []
    await kv.set('artists', current.filter((a) => a.id !== id))
  } catch {
    return Response.json({ error: 'KV error' }, { status: 500 })
  }
  return Response.json({ ok: true })
}
