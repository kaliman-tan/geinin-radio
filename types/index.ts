export type Platform = 'youtube' | 'spotify' | 'apple_podcast' | 'gera' | 'radiko' | 'other'

export interface Program {
  title: string
  platform: Platform
  url: string
  frequency: string
}

export interface Artist {
  id: string
  name: string
  members: string[]
  programs: Program[]
}
