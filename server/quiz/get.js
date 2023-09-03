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

const path = require('node:path')
const express = require('express')

const { AUTH_ALLOW_TEACHER, AUTH_ALLOW_STUDENT, verifyAuth } = require('../middlewares/auth')
const database = require('../database')
const asyncWrap = require('../utils/async-wrap')
const { parseQuiz } = require('./helpers/quiz')

const router = express.Router()
const imagesPath = path.resolve(__dirname, '../images')

router.get('/:code', verifyAuth(AUTH_ALLOW_TEACHER | AUTH_ALLOW_STUDENT), asyncWrap(async (req, res) => {
  const { payload } = res.locals
  const { code } = req.params
  const { username } = req.query

  const quiz = database.prepare('SELECT quizzes.*, users.username FROM quizzes JOIN users ON quizzes.user=users.id WHERE code=? LIMIT 1').get(code)
  if (!quiz) {
    return res.json({
      success: false,
      message: 'Quiz not found'
    })
  }

  const user = database.prepare('SELECT * FROM users WHERE username=? LIMIT 1').get(payload.type === 'student' || typeof username !== 'string' ? payload.username : username)
  if (!user) {
    return res.json({
      success: false,
      message: 'User not found'
    })
  }

  if (payload.type === 'student') {
    const enlisted = database.prepare('SELECT * FROM enlistment WHERE quiz=? AND user=? LIMIT 1').get(quiz.id, user.id)
    if (!enlisted) database.prepare('INSERT INTO enlistment (quiz, user) VALUES (?, ?)').run(quiz.id, user.id)
  }

  const { result, scores } = parseQuiz(quiz, user, payload.username === quiz.username)
  res.json({
    success: true,
    message: '',
    quiz: result,
    scores
  })
}))

router.get('/:code/image', asyncWrap(async (req, res) => {
  const { code } = req.params
  const quiz = database.prepare('SELECT default_image FROM quizzes WHERE code=? LIMIT 1').get(code)
  if (!quiz) {
    return res.json({
      success: false,
      message: 'Quiz not found'
    })
  }

  const defaultImage = quiz.default_image
  if (defaultImage !== null) {
    const imagePath = path.resolve(imagesPath, defaultImage)
    res.sendFile(imagePath)
  } else {
    res.json({
      success: true,
      message: 'Custom image is not yet supported'
    })
  }
}))

module.exports = router
