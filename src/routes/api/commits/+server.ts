import { connect } from '@planetscale/database'
import type { Commit } from '$lib/types'

export const config = {
  runtime: 'edge',
  regions: ["hnd1"]
}

const psconfig = {
  host: import.meta.env.VITE_DATABASE_HOST,
  username: import.meta.env.VITE_DATABASE_USERNAME,
  password: import.meta.env.VITE_DATABASE_PASSWORD,
}
const conn = connect(psconfig)

export async function GET({ url }) {
  const limit = parseInt(url.searchParams.get('limit') ?? '0') || 20

  const module = url.searchParams.get('module')
  const before = url.searchParams.get('before')

  const sql = `SELECT
    sha, message, DATE_FORMAT(date, '%m/%d') AS date_str, name AS module_name
    FROM Commit
    INNER JOIN Module ON Commit.module_id = Module.id
    ${module ? ` WHERE Module.name = ? ` : ``}
    ${before ? ` AND date < ? ` : ``}
    ORDER BY date DESC LIMIT ?
  `

  const parameters = [module, before, limit].filter(p => p !== null)

  const { rows } = await conn.execute(sql, parameters)
  const commits: Commit[] = rows.map(row => ({
    // @ts-ignore
    sha: row.sha,
    // @ts-ignore
    message: row.message,
    // @ts-ignore
    date: row.date_str,
    // @ts-ignore
    module: row.module_name,
  }))

  return new Response(JSON.stringify(commits))
}

export async function PUT() {
  const { rows } = await conn.execute(`SELECT id, path, (SELECT DATE_FORMAT(date, '%Y-%m-%dT%TZ') FROM Commit WHERE Commit.module_id = Module.id ORDER BY date DESC LIMIT 1) AS latest FROM Module`)

  const headers = new Headers()
  headers.append('Accept', 'application/vnd.github.v3+json')
  headers.append('Authorization', `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`)
  headers.append('X-GitHub-Api-Version', '2022-11-28')

  for (const row of rows) {
    const { id, path, latest } = row as { id: string, path: string, latest: string | null }

    const params = new URLSearchParams()
    params.append('path', path)
    params.append('sha', 'ue5-main')
    params.append('per_page', '100')
    latest && params.append('since', latest)

    const response = await fetch(`https://api.github.com/repos/Alexs7zzh/UnrealEngine/commits?${params.toString()}`, {
      method: 'GET',
      headers
    })
    const commits = await response.json()

    if (commits.length === 0) return

    await conn.transaction(async tx => {
      for (const commit of commits) {
        const { sha, commit: { message, author: { date } } } = commit
        const dateStr = new Date(date).toISOString().slice(0, 19).replace('T', ' ')

        await tx.execute('INSERT IGNORE INTO Commit (sha, message, date, module_id) VALUES (?, ?, ?, ?)', [sha, message, dateStr, id])
      }
    })
  }

  return new Response('ok')
}