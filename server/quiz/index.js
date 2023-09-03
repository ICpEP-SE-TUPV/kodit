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

const { AUTH_ALLOW_TEACHER, AUTH_ALLOW_STUDENT, verifyAuth } = require('../middlewares/auth')
const list = require('./list')
const create = require('./create')
const get = require('./get')
const edit = require('./edit')
const submission = require('./submission')
const submit = require('./submit')
const router = express.Router()

router.get('/', verifyAuth(AUTH_ALLOW_TEACHER | AUTH_ALLOW_STUDENT), list)
router.post('/', verifyAuth(AUTH_ALLOW_TEACHER), create)
router.use('/', get)
router.use('/', edit)
router.use('/', submission)
router.use('/', submit)

module.exports = router
