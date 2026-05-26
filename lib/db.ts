import { Pool } from 'pg'

// サーバーサイド専用 — クライアントコンポーネントからは絶対にimportしないこと
const globalPool = globalThis as typeof globalThis & { _pgPool?: Pool }

if (!globalPool._pgPool) {
  globalPool._pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
  })
}

export const pool = globalPool._pgPool
