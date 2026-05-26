import NextAuth from 'next-auth'
import PostgresAdapter from '@auth/pg-adapter'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { pool } from '@/lib/db'
import { loginSchema } from '@/lib/validations'
import { authConfig } from './auth.config'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PostgresAdapter(pool),
  session: { strategy: 'database' },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data
        const result = await pool.query(
          'SELECT id, name, email, password_hash FROM users WHERE email = $1',
          [email]
        )
        const user = result.rows[0]
        if (!user?.password_hash) return null

        const isValid = await bcrypt.compare(password, user.password_hash)
        if (!isValid) return null

        return {
          id: String(user.id),
          name: user.name as string,
          email: user.email as string,
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async session({ session, user }) {
      session.user.id = user.id
      return session
    },
  },
})
