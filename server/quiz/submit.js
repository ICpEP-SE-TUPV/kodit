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
const express = require('express')

const { AUTH_ALLOW_STUDENT, verifyAuth } = require('../middlewares/auth')
const database = require('../database')
const asyncWrap = require('../utils/async-wrap')
const { detectClassName } = require('../utils/java')
const { genString } = require('../utils/random')

const router = express.Router()
const mountPath = path.resolve(__dirname, '../../mount')
if (!fs.existsSync(mountPath)) fs.mkdirSync(mountPath)

const DOCKER_CPU_LIMIT = process.env.DOCKER_CPU_LIMIT || '1'
const DOCKER_MEMORY_LIMIT = process.env.DOCKER_MEMORY_LIMIT || '256MB'
const STARTUP_TIMEOUT = parseInt(process.env.STARTUP_TIMEOUT || '5000')
const EXECUTE_TIMEOUT = parseInt(process.env.EXECUTE_TIMEOUT || '30000')

router.post('/:code/:problem', verifyAuth(AUTH_ALLOW_STUDENT), asyncWrap(async (req, res) => {
  const { payload } = res.locals
  const { code: quizCode, problem: problemIndex } = req.params
  const { testcase: testcaseIndex, code, language } = req.body

  const quiz = database.prepare('SELECT * FROM quizzes WHERE code=? LIMIT 1').get(quizCode)
  if (!quiz) {
    return res.json({
      success: false,
      message: 'Quiz not found'
    })
  }

  const time = Date.now()
  if (quiz.date_start) {
    const startDate = new Date(quiz.date_start)
    const start = startDate.getTime()
    if (time < start) {
      return res.json({
        success: false,
        message: 'Quiz did not start yet'
      })
    }
  }

  if (quiz.date_end) {
    const endDate = new Date(quiz.date_end)
    const end = endDate.getTime()
    if (time > end) {
      return res.json({
        success: false,
        message: 'Quiz was already closed'
      })
    }
  }

  const user = database.prepare('SELECT * FROM users WHERE username=? LIMIT 1').get(payload.username)
  if (!user) {
    return res.json({
      success: false,
      message: 'User not found'
    })
  }

  const submitted = database.prepare('SELECT * FROM submissions WHERE user=? AND quiz=? LIMIT 1').get(user.id, quiz.id)
  if (submitted) {
    return res.json({
      success: true,
      message: 'Already submitted'
    })
  }

  const problem = database.prepare('SELECT * FROM problems WHERE quiz=? LIMIT ?, 1').get(quiz.id, problemIndex)
  if (!problem) {
    return res.json({
      success: false,
      message: 'Problem not found'
    })
  }

  const testcase = database.prepare('SELECT * FROM testcases WHERE problem=? LIMIT ?, 1').get(problem.id, testcaseIndex)
  if (!testcase) {
    return res.json({
      success: false,
      message: 'Testcase not found'
    })
  }

  const id = genString(64)
  const out = path.resolve(mountPath, id)
  let className = ''
  let output = ''
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
    return res.json({
      success: false,
      message
    })
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
  const expectedOutput = testcase.expected_output
  const inputs = testcase.inputs
  const points = parseInt(testcase.points)
  const inputsInterval = parseInt(testcase.inputs_interval)
  let currentInput = 0
  let interval = 0

  const timeout = setTimeout(() => {
    interval = setInterval(() => {
      if (currentInput === inputs.length) {
        cp.stdin.write('\n')
        output += '\n'
      }

      for (let i = currentInput; i < inputs.length; i++) {
        const char = inputs[currentInput]
        cp.stdin.write(char)
        output += char
        currentInput++
        if (char.match(/\s/)) break
      }
    }, inputsInterval)
  }, STARTUP_TIMEOUT)

  const killTimeout = setTimeout(() => {
    cp.kill(20000)
  }, EXECUTE_TIMEOUT)

  cp.stdout.on('data', (data) => {
    output += data.toString()
  })

  cp.stderr.on('data', (data) => {
    const message = data.toString().replaceAll(mountPath + path.sep, '')
    output += message
  })

  cp.on('exit', (code) => {
    if (code !== 0) output += `Program exited with code: ${code}`
  })

  cp.on('close', async () => {
    const correct = output.trim() === expectedOutput.trim()
    const score = correct ? points : 0

    const scoreRes = database.prepare('SELECT id FROM scores WHERE testcase=? AND user=? LIMIT 1').get(testcase.id, user.id)
    if (scoreRes) database.prepare('UPDATE scores SET code=?, language=?, output=?, score=? WHERE id=?').run(code, language, output, score, scoreRes.id)
    else database.prepare('INSERT INTO scores (testcase, code, language, output, score, user) VALUES (?, ?, ?, ?, ?, ?)').run(testcase.id, code, language, output, score, user.id)

    clearInterval(interval)
    clearTimeout(timeout)
    clearTimeout(killTimeout)

    res.json({
      success: true,
      message: '',
      score,
      output
    })
  })
}))

module.exports = router
