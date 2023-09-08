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

const database = require('../database')
const asyncWrap = require('../utils/async-wrap')
const { parseQuiz } = require('./helpers/quiz')

const listQuizzes = asyncWrap(async (req, res) => {
  const { payload } = res.locals
  const { query = '', offset = '0', limit = '8' } = req.query
  const nOffset = parseInt(offset)
  const nLimit = parseInt(limit)

  const user = database.prepare('SELECT * FROM users WHERE username=? LIMIT 1').get(payload.username)
  if (!user) {
    return res.json({
      success: false,
      message: 'User not found'
    })
  }

  const sQuery = `%${query}%`
  const stmt = payload.type === 'teacher'
    ? database.prepare('SELECT quizzes.*, users.username FROM quizzes JOIN users ON quizzes.user = users.id WHERE quizzes.name LIKE ? AND quizzes.user=? ORDER BY quizzes.date_created DESC')
    : database.prepare('SELECT quizzes.*, users.username, enlistment.user FROM quizzes JOIN users ON quizzes.user = users.id JOIN enlistment ON quizzes.id = enlistment.quiz WHERE quizzes.name LIKE ? AND enlistment.user=? ORDER BY quizzes.date_created DESC')

  const quizzesRes = stmt.all(sQuery, user.id)
  const count = quizzesRes.length
  const quizzes = quizzesRes.slice(nOffset, nOffset + nLimit)
  const results = []
  const resultsScore = []

  for (let i = 0; i < quizzes.length; i++) {
    const quiz = quizzes[i]
    const { result, scores } = parseQuiz(quiz, user)
    results.push(result)
    resultsScore.push(scores)
  }

  res.json({
    success: true,
    message: '',
    results,
    count,
    scores: resultsScore
  })
})

module.exports = listQuizzes
