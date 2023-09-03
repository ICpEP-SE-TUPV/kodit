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

const database = require('../database')
const { multipleInsert } = require('../database')
const schema = require('./helpers/schema')
const asyncWrap = require('../utils/async-wrap')
const { genString } = require('../utils/random')

const imagesPath = path.resolve(__dirname, '../images')
const images = fs.readdirSync(imagesPath)

const createQuiz = asyncWrap(async (req, res) => {
  const { quiz } = req.body
  const { payload } = res.locals
  const { username } = payload

  const validated = schema.validate(quiz)
  if (validated.error) {
    return res.json({
      success: false,
      message: validated.error.details[0].message
    })
  }

  const user = database.prepare('SELECT * FROM users WHERE username=? LIMIT 1').get(username)
  if (!user) {
    return res.json({
      success: false,
      message: 'User not found'
    })
  }

  let code = ''
  do {
    const random = genString(6)
    const match = database.prepare('SELECT id FROM quizzes WHERE code=?').get(random)
    if (typeof match === 'undefined') code = random
  } while (code === '')

  const dateStart = quiz.startDate || null
  const dateEnd = quiz.startDate && quiz.endDate ? quiz.endDate : null
  const image = images[Math.floor(Math.random() * images.length)]

  database.transaction(() => {
    const insertStmt = 'INSERT INTO quizzes (code, default_image, name, description, user, date_start, date_end) VALUES (?, ?, ?, ?, ?, ?, ?)'
    const info = database.prepare(insertStmt).run(code, image, quiz.name, quiz.description, user.id, dateStart, dateEnd)
    const quizId = info.lastInsertRowid
    const problemsArr = []
    for (let i = 0; i < quiz.problems.length; i++) {
      problemsArr.push({
        quizId,
        problem: quiz.problems[i].problem
      })
    }

    const insertProbStmt = 'INSERT INTO problems (quiz, problem) VALUES (@quizId, @problem)'
    const infos = multipleInsert(insertProbStmt, problemsArr)
    const problemsId = infos.map(info => info.lastInsertRowid)
    const rows = infos.length
    const testcasesArr = []

    for (let i = 0; i < rows; i++) {
      const problemId = problemsId[i]
      const problem = quiz.problems[i]

      for (let j = 0; j < problem.testcases.length; j++) {
        const testcase = problem.testcases[j]
        testcasesArr.push({
          problemId,
          expectedOutput: testcase.expectedOutput,
          points: testcase.points,
          hidden: testcase.hidden ? 1 : 0,
          inputs: testcase.inputs,
          inputsInterval: testcase.inputsInterval
        })
      }
    }

    multipleInsert(
      'INSERT INTO testcases (problem, expected_output, points, hidden, inputs, inputs_interval) ' +
      'VALUES (@problemId, @expectedOutput, @points, @hidden, @inputs, @inputsInterval)',
      testcasesArr
    )
  })()

  res.json({
    success: true,
    message: '',
    code
  })
})

module.exports = createQuiz
