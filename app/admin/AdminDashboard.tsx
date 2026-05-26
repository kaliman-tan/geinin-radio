'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Artist, Platform } from '@/types'
import InitialAvatar from '@/components/InitialAvatar'
import PlatformBadge from '@/components/PlatformBadge'
import { platformDisplayName } from '@/components/PlatformBadge'

interface PodcastResult {
  title: string
  creator: string
  url: string
}

interface ManualProgram {
  platform: Platform
  title: string
  url: string
  frequency: string
}

function generateId(name: string): string {
  return name.replace(/\s+/g, '-') + '-' + Date.now().toString(36)
}

const PLATFORMS: Platform[] = ['youtube', 'spotify', 'radiko', 'gera', 'apple_podcast', 'other']

type Tab = 'list' | 'add'

export default function AdminDashboard({
  kvArtists,
  staticArtists,
}: {
  kvArtists: Artist[]
  staticArtists: Artist[]
}) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('list')
  const [artists, setArtists] = useState(kvArtists)
  const allArtists = [...artists, ...staticArtists]

  // Apple Podcast検索
  const [name, setName] = useState('')
  const [members, setMembers] = useState('')
  const [results, setResults] = useState<PodcastResult[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)

  // 手動追加
  const [manualPrograms, setManualPrograms] = useState<ManualProgram[]>([])
  const [manualPlatform, setManualPlatform] = useState<Platform>('youtube')
  const [manualTitle, setManualTitle] = useState('')
  const [manualUrl, setManualUrl] = useState('')
  const [manualFrequency, setManualFrequency] = useState('不定期')

  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const totalSelected = selected.size + manualPrograms.length

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.refresh()
  }

  const deleteArtist = async (id: string) => {
    if (!confirm('この芸人を削除しますか？')) return
    setDeletingId(id)
    await fetch(`/api/artists/${id}`, { method: 'DELETE' })
    setArtists((prev) => prev.filter((a) => a.id !== id))
    setDeletingId(null)
  }

  const search = async () => {
    if (!name.trim()) return
    setSearching(true)
    setSearched(false)
    setResults([])
    setSelected(new Set())
    try {
      const res = await fetch(`/api/podcast-search?q=${encodeURIComponent(name)}`)
      const data = await res.json()
      setResults(data.results)
    } finally {
      setSearching(false)
      setSearched(true)
    }
  }

  const toggleSelect = (i: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const addManualProgram = () => {
    if (!manualTitle.trim() || !manualUrl.trim()) return
    setManualPrograms((prev) => [
      ...prev,
      { platform: manualPlatform, title: manualTitle.trim(), url: manualUrl.trim(), frequency: manualFrequency || '不定期' },
    ])
    setManualTitle('')
    setManualUrl('')
  }

  const removeManualProgram = (i: number) => {
    setManualPrograms((prev) => prev.filter((_, idx) => idx !== i))
  }

  const save = async () => {
    if (totalSelected === 0) return
    setSaving(true)
    const applePrograms = [...selected].map((i) => ({
      title: results[i].title,
      platform: 'apple_podcast' as Platform,
      url: results[i].url,
      frequency: '不定期',
    }))
    const artist: Artist = {
      id: generateId(name),
      name: name.trim(),
      members: members.split(/[、,，\s]+/).map((m) => m.trim()).filter(Boolean),
      programs: [...applePrograms, ...manualPrograms],
    }
    await fetch('/api/artists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(artist),
    })
    setArtists((prev) => [artist, ...prev])
    setName('')
    setMembers('')
    setResults([])
    setSelected(new Set())
    setSearched(false)
    setManualPrograms([])
    setTab('list')
    setSaving(false)
  }

  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-white">
      <header className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Link href="/" className="p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="font-bold text-gray-900">管理ページ</h1>
        </div>
        <button onClick={logout} className="text-xs text-gray-400 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors">
          ログアウト
        </button>
      </header>

      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setTab('list')}
          className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${tab === 'list' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          登録済み（{allArtists.length}）
        </button>
        <button
          onClick={() => setTab('add')}
          className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${tab === 'add' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          ＋ 芸人を追加
        </button>
      </div>

      <main className="pb-8">
        {/* 登録済みリスト */}
        {tab === 'list' && (
          <ul>
            {allArtists.map((artist) => {
              const isStatic = staticArtists.some((a) => a.id === artist.id)
              const platforms = Array.from(new Set(artist.programs.map((p) => p.platform as Platform)))
              return (
                <li key={artist.id} className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
                  <InitialAvatar name={artist.name} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-gray-900">{artist.name}</span>
                      {isStatic && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded font-medium">初期データ</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {artist.programs.length}番組{artist.members.length > 0 && ` · ${artist.members.join('・')}`}
                    </div>
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {platforms.map((p) => <PlatformBadge key={p} platform={p} />)}
                    </div>
                  </div>
                  {isStatic ? <div className="w-8" /> : (
                    <button
                      onClick={() => deleteArtist(artist.id)}
                      disabled={deletingId === artist.id}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-40"
                      aria-label="削除"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        )}

        {/* 追加フォーム */}
        {tab === 'add' && (
          <div className="px-4 pt-4 pb-8 space-y-5">
            {/* 芸人名 */}
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">芸人名（必須）</label>
                <input
                  type="text"
                  placeholder="例：さらば青春の光"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full px-3 py-2.5 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">メンバー（任意・読点区切り）</label>
                <input
                  type="text"
                  placeholder="例：森田哲矢、東ブクロ"
                  value={members}
                  onChange={(e) => setMembers(e.target.value)}
                  className="mt-1 w-full px-3 py-2.5 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Apple Podcast検索 */}
            <div className="space-y-3">
              <p className="text-xs text-gray-500 font-medium">Apple Podcastから検索</p>
              <button
                onClick={search}
                disabled={!name.trim() || searching}
                className="w-full py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-xl disabled:opacity-40 hover:bg-purple-700 active:bg-purple-800 transition-colors"
              >
                {searching ? '検索中...' : 'Apple Podcastで検索'}
              </button>
              {searched && (
                results.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-2">番組が見つかりませんでした</p>
                ) : (
                  <ul className="space-y-2">
                    {results.map((r, i) => (
                      <li
                        key={i}
                        onClick={() => toggleSelect(i)}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selected.has(i) ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <div className={`mt-0.5 w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${selected.has(i) ? 'bg-gray-900 border-gray-900' : 'border-gray-300'}`}>
                          {selected.has(i) && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{r.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{r.creator}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )
              )}
            </div>

            {/* 手動入力 */}
            <div className="space-y-3">
              <p className="text-xs text-gray-500 font-medium">他の媒体の番組をURLで追加</p>
              <div className="space-y-2">
                <select
                  value={manualPlatform}
                  onChange={(e) => setManualPlatform(e.target.value as Platform)}
                  className="w-full px-3 py-2.5 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-colors"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>{platformDisplayName[p]}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="番組名"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-colors"
                />
                <input
                  type="url"
                  placeholder="URL（https://...）"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-colors"
                />
                <div className="flex gap-2">
                  <select
                    value={manualFrequency}
                    onChange={(e) => setManualFrequency(e.target.value)}
                    className="flex-1 px-3 py-2.5 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-colors"
                  >
                    <option>週1回</option>
                    <option>週2回</option>
                    <option>月1回</option>
                    <option>不定期</option>
                  </select>
                  <button
                    onClick={addManualProgram}
                    disabled={!manualTitle.trim() || !manualUrl.trim()}
                    className="px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl disabled:opacity-40 hover:bg-gray-800 transition-colors"
                  >
                    追加
                  </button>
                </div>
              </div>

              {/* 手動追加済み番組リスト */}
              {manualPrograms.length > 0 && (
                <ul className="space-y-2">
                  {manualPrograms.map((p, i) => (
                    <li key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                      <PlatformBadge platform={p.platform} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                        <p className="text-xs text-gray-400">{p.frequency}</p>
                      </div>
                      <button
                        onClick={() => removeManualProgram(i)}
                        className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 保存ボタン */}
            {totalSelected > 0 && (
              <button
                onClick={save}
                disabled={saving || !name.trim()}
                className="w-full py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl disabled:opacity-40 hover:bg-gray-800 active:bg-black transition-colors"
              >
                {saving ? '保存中...' : `${totalSelected}番組で「${name}」を追加`}
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
