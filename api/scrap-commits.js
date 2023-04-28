import { connect } from '@planetscale/database'

// export const config = {
//   runtime: 'edge', regions: 'hnd1'
// }

const psconfig = {
  host: process.env.VITE_DATABASE_HOST,
  username: process.env.VITE_DATABASE_USERNAME,
  password: process.env.VITE_DATABASE_PASSWORD,
}
const conn = connect(psconfig)

export default async (request, response) => {
  const { rows } = await conn.execute(`SELECT id, path, (SELECT DATE_FORMAT(date, '%Y-%m-%dT%TZ') FROM Commit WHERE Commit.module_id = Module.id ORDER BY date DESC LIMIT 1) AS latest FROM Module`)

  const headers = new Headers()
  headers.append('Accept', 'application/vnd.github.v3+json')
  headers.append('Authorization', `Bearer ${process.env.GITHUB_TOKEN}`)
  headers.append('X-GitHub-Api-Version', '2022-11-28')

  for (const row of rows) {
    const { id, path, latest } = row

    const params = new URLSearchParams()
    params.append('path', path)
    params.append('sha', 'ue5-main')
    params.append('per_page', 100)
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

  response.end('ok')
}
