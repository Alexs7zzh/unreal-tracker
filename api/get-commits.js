import { connect } from '@planetscale/database'

const psconfig = {
  host: process.env.VITE_DATABASE_HOST,
  username: process.env.VITE_DATABASE_USERNAME,
  password: process.env.VITE_DATABASE_PASSWORD,
}
const conn = connect(psconfig)

export default async (request, response) => {
  const limit = request.query.limit || 20

  const sql = `SELECT
    sha, message, date, name AS module_name
    FROM Commit
    INNER JOIN Module ON Commit.module_id = Module.id
    ${request.query.module ? ` WHERE Module.name = ? ` : ``}
    ${request.query.before ? ` AND date < ? ` : ``}
    ORDER BY date DESC LIMIT ?
  `

  const parameters = [request.query.module, request.query.before, limit].filter(p => p && true)

  const { rows } = await conn.execute(sql, parameters)

  response.end(JSON.stringify(rows))
}
