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
const http = require('node:http')
const express = require('express')
const socketio = require('socket.io')
const cors = require('cors')
const dotenv = require('dotenv')

const defEnvPath = path.resolve(__dirname, '../.env')
const localEnvPath = path.resolve(__dirname, '../.env.local')

if (fs.existsSync(defEnvPath)) dotenv.config({ path: defEnvPath })
if (fs.existsSync(localEnvPath)) dotenv.config({ path: localEnvPath, override: true })

const database = require('./database')
const user = require('./user')
const quiz = require('./quiz')
const terminal = require('./terminal')
let server = null

const app = express()
const port = process.env.SERVER_PORT || process.env.PORT || '3001'
const appBuild = path.resolve(__dirname, '../build')

app.use(cors())
app.use(express.static(appBuild))
app.use(express.json())

app.use('/user', user)
app.use('/quiz', quiz)

app.use((err, req, res, next) => {
  console.error(err)
  res.json({
    success: false,
    message: err.message
  })
})

app.use('*', (req, res) => {
  const indexPath = path.resolve(__dirname, '../build/index.html')
  res.sendFile(indexPath)
})

server = http.createServer(app)
server.listen(port, '0.0.0.0', () => {
  const io = socketio(server, {
    path: '/sockets',
    cors: { methods: ['GET', 'POST'] }
  })

  terminal(io)
  console.log(`Server is running on port ${port}`)
})

function handleExit () {
  database.close()
  process.exit()
}

process.on('exit', handleExit)
process.on('SIGINT', handleExit)
process.on('SIGUSR1', handleExit)
process.on('SIGUSR2', handleExit)
process.on('uncaughtException', handleExit)
