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

const express = require('express')

const { AUTH_ALLOW_TEACHER, verifyAuth } = require('../middlewares/auth')
const database = require('../database')
const { multipleInsert } = require('../database')
const schema = require('./helpers/schema')
const asyncWrap = require('../utils/async-wrap')

const router = express.Router()

router.post('/:code', verifyAuth(AUTH_ALLOW_TEACHER), asyncWrap(async (req, res) => {
  const { payload } = res.locals
  const { quiz } = req.body
  const { code } = req.params
  const { username } = payload

  const validated = schema.validate(quiz)
  if (validated.error) {
    return res.json({
      success: false,
      message: validated.error.details[0].message
    })
  }

  const quizExist = database.prepare('SELECT id FROM quizzes WHERE code=? LIMIT 1').get(code)
  if (!quizExist) {
    return res.json({
      success: false,
      message: 'Quiz does not exist'
    })
  }

  const quizId = quizExist.id
  const user = database.prepare('SELECT * FROM users WHERE username=? LIMIT 1').get(username)
  if (!user) {
    return res.json({
      success: false,
      message: 'User not found'
    })
  }

  const dateStart = quiz.startDate || null
  const dateEnd = quiz.startDate && quiz.endDate ? quiz.endDate : null

  database.transaction(() => {
    database.prepare('DELETE FROM problems WHERE quiz=?').run(quizId)
    database.prepare('DELETE FROM submissions WHERE quiz=?').run(quizId)
    database.prepare('UPDATE quizzes SET name=?, description=?, date_start=?, date_end=? WHERE id=?').run(quiz.name, quiz.description, dateStart, dateEnd, quizId)

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
    message: ''
  })
}))

module.exports = router
