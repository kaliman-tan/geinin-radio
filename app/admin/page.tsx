import { cookies } from 'next/headers'
import { redis } from '@/lib/redis'
import type { Artist } from '@/types'
import LoginForm from './LoginForm'
import AdminDashboard from './AdminDashboard'

export default async function AdminPage() {
  const cookieStore = await cookies()
  const isAuthed = cookieStore.get('admin_token')?.value === process.env.ADMIN_PASSWORD

  if (!isAuthed) {
    return <LoginForm />
  }

  let artists: Artist[] = []
  try {
    artists = await redis.get<Artist[]>('artists') ?? []
  } catch {
    // Redis未設定時は空配列
  }

  return <AdminDashboard initialArtists={artists} />
}
