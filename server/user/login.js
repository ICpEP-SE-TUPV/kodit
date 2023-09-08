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
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const { AUTH_ALLOW_ALL, verifyAuth } = require('../middlewares/auth')
const database = require('../database')
const { JWT_KEY, JWT_ISSUER } = require('../variables')
const asyncWrap = require('../utils/async-wrap')
const { genString } = require('../utils/random')

const router = express.Router()
const subject = 'user'

router.post('/', verifyAuth(AUTH_ALLOW_ALL, subject, true), asyncWrap(async (req, res) => {
  const oldPayload = res.locals.payload
  const { username, password } = req.body

  if (oldPayload !== null) {
    database.prepare('UPDATE users_log SET uniq_id=? WHERE uniq_id=?').run(oldPayload.id, oldPayload.id)
    const token = jwt.sign(oldPayload, JWT_KEY, {
      issuer: JWT_ISSUER,
      expiresIn: '12h',
      subject
    })

    return res.json({
      success: true,
      message: '',
      token
    })
  }

  const user = database.prepare('SELECT users.*, user_types.type AS user_type FROM users JOIN user_types ON users.type = user_types.id WHERE username=? LIMIT 1').get(username)
  if (user) {
    const result = await bcrypt.compare(password, user.password)
    if (result) {
      const id = genString(36)
      const type = user.user_type
      const name = user.name
      const payload = { id, type, username, name }
      const token = jwt.sign(payload, JWT_KEY, {
        issuer: JWT_ISSUER,
        expiresIn: '12h',
        subject
      })

      database.prepare('INSERT INTO users_log (uniq_id, user) VALUES (?, ?)').run(id, user.id)
      res.json({
        success: true,
        message: '',
        token
      })
    } else {
      res.json({
        success: false,
        message: 'Incorrect password',
        token: null
      })
    }
  } else {
    res.json({
      success: false,
      message: 'No user found',
      token: null
    })
  }
}))

module.exports = router
