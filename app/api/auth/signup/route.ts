import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { pool } from '@/lib/db'
import { signupSchema } from '@/lib/validations'
import { authRatelimit } from '@/lib/rate-limit'

function getIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
}

export async function POST(req: NextRequest) {
  const ip = getIp(req)
  const { success } = await authRatelimit.limit(ip)
  if (!success) {
    return Response.json(
      { error: 'リクエストが多すぎます。しばらくしてからお試しください。' },
      { status: 429 }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: '不正なリクエストです' }, { status: 400 })
  }

  const parsed = signupSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? '入力内容を確認してください' },
      { status: 400 }
    )
  }

  const { name, email, password } = parsed.data

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email])
  if ((existing.rows as unknown[]).length > 0) {
    return Response.json(
      { error: 'このメールアドレスは既に登録されています' },
      { status: 409 }
    )
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await pool.query(
    'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)',
    [name, email, passwordHash]
  )

  return Response.json({ ok: true }, { status: 201 })
}
