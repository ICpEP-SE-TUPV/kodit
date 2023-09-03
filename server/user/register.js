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
const bcrypt = require('bcrypt')

const database = require('../database')
const asyncWrap = require('../utils/async-wrap')

const router = express.Router()

router.post('/', asyncWrap(async (req, res) => {
  const { name, username, password, isFaculty } = req.body

  const user = database.prepare('SELECT * FROM users WHERE username=? LIMIT 1').get(username)
  if (user) {
    return res.json({
      success: false,
      message: 'User already exists'
    })
  }

  const hashed = await bcrypt.hash(password, 10)
  const type = isFaculty ? 1 : 2
  database.prepare('INSERT INTO users (name, type, username, password) VALUES (?, ?, ?, ?)').run(name, type, username, hashed)

  res.json({
    success: true,
    message: ''
  })
}))

module.exports = router
