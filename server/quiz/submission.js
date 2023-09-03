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

const express = require('express')

const { AUTH_ALLOW_STUDENT, AUTH_ALLOW_TEACHER, verifyAuth } = require('../middlewares/auth')
const database = require('../database')
const asyncWrap = require('../utils/async-wrap')

const router = express.Router()

router.get('/:code/submission', verifyAuth(AUTH_ALLOW_STUDENT), asyncWrap(async (req, res) => {
  const { payload } = res.locals
  const { code } = req.params

  const quiz = database.prepare('SELECT * FROM quizzes WHERE code=? LIMIT 1').get(code)
  if (!quiz) {
    return res.json({
      success: false,
      message: 'Quiz not found'
    })
  }

  const user = database.prepare('SELECT * FROM users WHERE username=? LIMIT 1').get(payload.username)
  if (!user) {
    return res.json({
      success: false,
      message: 'User not found'
    })
  }

  const submission = database.prepare('SELECT date_created FROM submissions WHERE quiz=? AND user=? LIMIT 1').get(quiz.id, user.id)
  if (!submission) {
    return res.json({
      success: true,
      message: '',
      submission: null
    })
  }

  res.json({
    success: true,
    message: '',
    submission: {
      username: user.username,
      quiz: quiz.code,
      dateSubmitted: submission.date_created.replace(/ /g, 'T')
    }
  })
}))

router.post('/:code/submission', verifyAuth(AUTH_ALLOW_STUDENT), asyncWrap(async (req, res) => {
  const { payload } = res.locals
  const { code } = req.params

  const quiz = database.prepare('SELECT * FROM quizzes WHERE code=? LIMIT 1').get(code)
  if (!quiz) {
    return res.json({
      success: false,
      message: 'Quiz not found'
    })
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
      success: false,
      message: 'Already submitted'
    })
  }

  database.prepare('INSERT INTO submissions (user, quiz) VALUES (?, ?)').run(user.id, quiz.id)
  res.json({
    success: true,
    message: ''
  })
}))

router.get('/:code/submissions', verifyAuth(AUTH_ALLOW_TEACHER), asyncWrap(async (req, res) => {
  const { payload } = res.locals
  const { code } = req.params

  const quiz = database.prepare('SELECT * FROM quizzes WHERE code=? LIMIT 1').get(code)
  if (!quiz) {
    return res.json({
      success: false,
      message: 'Quiz not found'
    })
  }

  const user = database.prepare('SELECT * FROM users WHERE username=? LIMIT 1').get(payload.username)
  if (!user) {
    return res.json({
      success: false,
      message: 'User not found'
    })
  }

  const submissions = []
  const submissionsRes = database.prepare('SELECT submissions.date_created, users.username FROM submissions JOIN users ON submissions.user=users.id WHERE quiz=?').all(quiz.id)

  for (let i = 0; i < submissionsRes.length; i++) {
    const submission = submissionsRes[i]
    submissions.push({
      username: submission.username,
      quiz: quiz.code,
      dateSubmitted: submission.date_created.replace(/ /g, 'T')
    })
  }

  res.json({
    success: true,
    message: '',
    submissions
  })
}))

module.exports = router
