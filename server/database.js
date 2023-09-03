/**
 *  COMPILEX
 *  Copyright (C) 2023, Adriane Justine Tan
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

const fs = require('node:fs')
const path = require('node:path')
const Database = require('better-sqlite3-multiple-ciphers')
const { DB_KEY } = require('./variables')

const databasePath = path.resolve(__dirname, '../compilex.db')
const setupPath = path.resolve(__dirname, 'database.sql')
const setupSql = fs.readFileSync(setupPath, { encoding: 'utf-8' })

const database = new Database(databasePath)
database.pragma('cipher = \'sqlcipher\'')
database.pragma('legacy = 4')
database.pragma(`key = '${DB_KEY}'`)
database.pragma('journal_mode = WAL')
database.exec(setupSql)

function multipleInsert (query, values) {
  const statement = database.prepare(query)
  const infos = []
  const transaction = database.transaction((rows) => {
    for (const row of rows) {
      const info = statement.run(row)
      infos.push(info)
    }
  })

  transaction(values)
  return infos
}

module.exports = database
module.exports.multipleInsert = multipleInsert
