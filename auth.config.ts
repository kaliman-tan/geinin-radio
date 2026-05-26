import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      if (nextUrl.pathname.startsWith('/favorites') && !isLoggedIn) {
        return false
      }
      return true
    },
  },
  providers: [],
} satisfies NextAuthConfig
