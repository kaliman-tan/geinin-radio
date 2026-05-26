import { cookies } from 'next/headers'
import { redis } from '@/lib/redis'
import artistsData from '@/data/artists.json'
import type { Artist } from '@/types'
import LoginForm from './LoginForm'
import AdminDashboard from './AdminDashboard'

export default async function AdminPage() {
  const cookieStore = await cookies()
  const isAuthed = !!process.env.ADMIN_PASSWORD &&
    cookieStore.get('admin_token')?.value === process.env.ADMIN_PASSWORD

  if (!isAuthed) {
    return <LoginForm />
  }

  let kvArtists: Artist[] = []
  try {
    kvArtists = await redis.get<Artist[]>('artists') ?? []
  } catch {
    // Redis未設定時は空配列
  }

  return (
    <AdminDashboard
      kvArtists={kvArtists}
      staticArtists={artistsData as Artist[]}
    />
  )
}
