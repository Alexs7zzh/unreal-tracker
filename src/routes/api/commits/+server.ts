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

  let sql
  if (module) {
    sql = `
      SELECT
        sha, message,
        DATE_FORMAT(date, '%m/%d') AS date_str,
        name as modules
      FROM Module
      INNER JOIN CommitModule ON CommitModule.module_id = Module.id
      INNER JOIN Commit ON Commit.id = CommitModule.commit_id
      WHERE name = ?
      ${before ? `WHERE date < ? ` : ``}
      ORDER BY date DESC LIMIT ?
    `
  } else {
    sql = `
      SELECT
        sha, message,
        DATE_FORMAT(date, '%m/%d') AS date_str,
        (
          SELECT
            GROUP_CONCAT(name)
          FROM Module
          INNER JOIN CommitModule ON CommitModule.module_id = Module.id
          WHERE CommitModule.commit_id = Commit.id
        ) AS modules
      FROM Commit
      ${before ? `WHERE date < ? ` : ``}
      ORDER BY date DESC LIMIT ?
    `
  }

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
    modules: row.modules,
  }))

  return new Response(JSON.stringify(commits))
}

export async function PUT() {
  const { rows } = await conn.execute(`
    SELECT
      id, path,
      (
        SELECT
          DATE_FORMAT(date, '%Y-%m-%dT%TZ')
        FROM Commit
        WHERE Commit.id =
        (
          SELECT
            commit_id
          FROM CommitModule
          WHERE CommitModule.module_id = Module.id
          ORDER BY commit_id DESC
          LIMIT 1
        )
      ) AS latest
      FROM Module
    `)

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
    /** Used for populating the database */
    // latest && params.append('until', latest)
    // params.append('since', '2022-10-01T00:00:00Z')

    const response = await fetch(`https://api.github.com/repos/Alexs7zzh/UnrealEngine/commits?${params.toString()}`, {
      method: 'GET',
      headers
    })
    const commits = await response.json()

    if (commits.length === 0) return

    for (const commit of commits) {
      const { sha, commit: { message, author: { date } } } = commit
      const dateStr = new Date(date).toISOString().slice(0, 19).replace('T', ' ')

      await conn.execute('INSERT IGNORE INTO Commit (sha, message, date) VALUES (?, ?, ?)', [sha, message, dateStr])
      await conn.execute('INSERT IGNORE INTO CommitModule (commit_id, module_id) VALUES ((SELECT id FROM Commit WHERE sha = ?), ?)', [sha, id])
    }
  }

  return new Response('ok')
}