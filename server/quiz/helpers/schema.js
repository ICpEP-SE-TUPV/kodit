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

const Joi = require('joi')

const testcaseSchema = Joi.object({
  expectedOutput: Joi.string().required(),
  points: Joi.number().min(1).required(),
  inputs: Joi.string().allow('').required(),
  inputsInterval: Joi.number().min(500).required(),
  hidden: Joi.boolean().required()
})

const problemSchema = Joi.object({
  problem: Joi.string().required(),
  testcases: Joi.array().items(testcaseSchema).has(testcaseSchema)
})

module.exports = Joi.object({
  code: Joi.string().length(6),
  name: Joi.string().min(1).max(255).required(),
  description: Joi.string().allow('').required(),
  username: Joi.string().allow('').required(),
  problems: Joi.array().items(problemSchema).has(problemSchema),
  startDate: Joi.date().iso().allow('').required(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).allow('').required()
})
