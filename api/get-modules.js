import { connect } from '@planetscale/database'

const psconfig = {
  host: process.env.VITE_DATABASE_HOST,
  username: process.env.VITE_DATABASE_USERNAME,
  password: process.env.VITE_DATABASE_PASSWORD,
}
const conn = connect(psconfig)

export default async (request, response) => {
  const { rows } = await conn.execute(`SELECT name FROM Module ORDER BY id ASC`)

  const modules = rows.map(row => row.name)

  response.end(JSON.stringify(modules))
}
