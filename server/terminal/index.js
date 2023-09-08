/**
 *  KodIt
 *  Copyright (C) 2023, ICpEP.SE - TUPV
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
const { spawn } = require('node:child_process')
const jwt = require('jsonwebtoken')

const { detectClassName } = require('../utils/java')
const { JWT_KEY, JWT_ISSUER } = require('../variables')

const terminals = {}
const mountPath = path.resolve(__dirname, '../../mount')
if (!fs.existsSync(mountPath)) fs.mkdirSync(mountPath)

const DOCKER_CPU_LIMIT = process.env.DOCKER_CPU_LIMIT || '1'
const DOCKER_MEMORY_LIMIT = process.env.DOCKER_MEMORY_LIMIT || '256MB'

async function initialize (socket) {
  const id = socket.id
  terminals[id] = null

  socket.on('code', async (data) => {
    if (terminals[id] !== null) return

    const { code, language } = data
    const out = path.resolve(mountPath, id)
    let className = ''
    await fs.promises.mkdir(out)

    try {
      let srcOut = ''
      if (language === 'c') srcOut = path.resolve(out, 'main.c')
      if (language === 'cpp') srcOut = path.resolve(out, 'main.cpp')
      if (language === 'java') {
        className = detectClassName(code)
        srcOut = path.resolve(out, `${className}.java`)
      }

      await fs.promises.writeFile(srcOut, code)
    } catch (error) {
      const message = error.message.replaceAll(mountPath + path.sep, '')
      socket.emit('terminal_error', message)
      socket.disconnect(true)
      return
    }

    const cmd = 'docker'
    const args = [
      'run',
      '-v', `${out}/:/usr/src/`,
      '--rm',
      '--cpus', DOCKER_CPU_LIMIT,
      '--memory', DOCKER_MEMORY_LIMIT,
      '-w', '/usr/src',
      '-i',
      'eidoriantan/kodit-program:latest',
      'sh', '-c'
    ]

    if (language === 'c') args.push('"gcc main.c -o main && ./main"')
    if (language === 'cpp') args.push('"g++ main.cpp -o main && ./main"')
    if (language === 'java') args.push(`"javac ${className}.java && java -classpath . ${className}"`)

    const cp = spawn(cmd, args, { shell: true, windowsHide: true })
    cp.stdout.on('data', (data) => {
      socket.emit('output', data.toString())
    })

    cp.stderr.on('data', (data) => {
      const message = data.toString().replaceAll(mountPath + path.sep, '')
      socket.emit('terminal_error', message)
      socket.disconnect(true)
    })

    cp.on('exit', (code) => {
      if (code !== 0) socket.emit('terminal_error', `Program exited with code: ${code}`)
    })

    cp.on('close', (code) => {
      terminals[id] = null
      socket.disconnect(true)
    })

    terminals[id] = cp
  })

  socket.on('input', (key) => {
    const cp = terminals[id]
    if (cp === null) return

    let char = ''
    if (key === 'Enter') char = '\n'
    else if (key === 'Backspace') char = '\b'
    else if (key === 'Tab') char = '\t'
    else if (key.length > 1) char = ''
    else char = key

    cp.stdin.write(char)
    socket.emit('output', char)
  })

  socket.on('disconnect', () => {
    const cp = terminals[id]
    if (cp === null) return

    cp.kill()
  })
}

module.exports = (io) => {
  io.of('/terminal').use((socket, next) => {
    const token = socket.handshake.auth.token
    let payload = null

    try {
      payload = jwt.verify(token, JWT_KEY, {
        issuer: JWT_ISSUER,
        subject: 'user'
      })
    } catch (error) {
      const err = new Error('Invalid token')
      next(err)
    }

    if (payload !== null) next()
  })

  io.of('/terminal').on('connection', initialize)
}
