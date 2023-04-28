import { connect } from '@planetscale/database'

export const config = {
  runtime: 'edge',
  regions: ["hnd1"]
}

type Module = { name: string }


const psconfig = {
  host: import.meta.env.VITE_DATABASE_HOST,
  username: import.meta.env.VITE_DATABASE_USERNAME,
  password: import.meta.env.VITE_DATABASE_PASSWORD,
}
const conn = connect(psconfig)

export async function GET() {
  const result = await conn.execute(`SELECT name FROM Module ORDER BY id ASC`)

  const modules = (result.rows as Module[]).map(row => row.name)

  return new Response(JSON.stringify(modules))
}