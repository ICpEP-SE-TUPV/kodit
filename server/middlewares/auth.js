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

const jwt = require('jsonwebtoken')

const asyncWrap = require('../utils/async-wrap')
const { JWT_KEY, JWT_ISSUER } = require('../variables')

const AUTH_ALLOW_ALL = 0
const AUTH_ALLOW_TEACHER = 0b00000001
const AUTH_ALLOW_STUDENT = 0b00000010

const verifyAuth = (type = AUTH_ALLOW_ALL, subject = 'user', ignoreExpiration = false) => asyncWrap(async (req, res, next) => {
  const auth = req.get('Authorization')
  let payload = null

  try {
    if (!auth || !auth.match(/^(Bearer ([\w-]+\.[\w-]+\.[\w-]+))$/i)) throw new Error()

    const token = auth.split(' ')[1]
    payload = jwt.verify(token, JWT_KEY, {
      issuer: JWT_ISSUER,
      subject,
      ignoreExpiration
    })
  } catch (error) {
    if (type !== AUTH_ALLOW_ALL) {
      return res.json({
        success: false,
        message: 'Invalid token'
      })
    }
  }

  if (
    type !== AUTH_ALLOW_ALL &&
    (
      (payload.type === 'teacher' && (type & (1 << 0)) === 0) ||
      (payload.type === 'student' && (type & (1 << 1)) === 0)
    )
  ) {
    return res.json({
      success: false,
      message: 'Forbidden'
    })
  }

  res.locals.payload = payload
  next()
})

module.exports = {
  AUTH_ALLOW_ALL,
  AUTH_ALLOW_TEACHER,
  AUTH_ALLOW_STUDENT,
  verifyAuth
}
