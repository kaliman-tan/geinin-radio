import { cookies } from 'next/headers'
import { kv } from '@vercel/kv'
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
    artists = await kv.get<Artist[]>('artists') ?? []
  } catch {
    // KV未設定時は空配列
  }

  return <AdminDashboard initialArtists={artists} />
}
