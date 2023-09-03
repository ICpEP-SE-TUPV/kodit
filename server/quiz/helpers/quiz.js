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

const database = require('../../database')

function parseQuiz (quiz, user, showHidden = false) {
  const result = {
    code: quiz.code,
    name: quiz.name,
    description: quiz.description,
    username: quiz.username,
    startDate: quiz.date_start,
    endDate: quiz.date_end,
    problems: []
  }

  const scores = []
  const problemIds = []
  const problems = database.prepare(`
    SELECT
      problems.id,
      problems.problem,
      testcases.id AS testcase_id,
      testcases.expected_output,
      testcases.points,
      testcases.hidden,
      testcases.inputs,
      testcases.inputs_interval
    FROM problems
    JOIN testcases ON testcases.problem=problems.id
    WHERE problems.quiz=?
  `).all(quiz.id)

  for (let j = 0; j < problems.length; j++) {
    const problem = problems[j]
    let problemIndex = problemIds.indexOf(problem.id)
    if (problemIndex < 0) {
      problemIndex = problemIds.push(problem.id) - 1
      result.problems.push({
        problem: problem.problem,
        testcases: []
      })
    }

    const owner = user.username === quiz.username
    const testcaseIndex = result.problems[problemIndex].testcases.push({
      expectedOutput: problem.hidden === 1 && !owner && !showHidden ? '' : problem.expected_output,
      points: problem.points,
      hidden: problem.hidden === 1,
      inputs: problem.hidden === 1 && !owner && !showHidden ? '' : problem.inputs,
      inputsInterval: problem.inputs_interval
    }) - 1

    if (user) {
      if (owner) {
        const scoresRes = database.prepare(`
          SELECT scores.*, users.name, users.username
          FROM enlistment
          JOIN users ON enlistment.user=users.id
          LEFT JOIN scores ON enlistment.user=scores.user AND scores.testcase=?
          WHERE enlistment.quiz=?
        `).all(problem.testcase_id, quiz.id)

        for (let i = 0; i < scoresRes.length; i++) {
          const score = scoresRes[i]
          scores.push({
            problem: problemIndex,
            testcase: testcaseIndex,
            name: score.name,
            username: score.username,
            code: score.code || '',
            language: score.language || '',
            output: score.output || '',
            score: score.score || 0
          })
        }
      } else {
        const score = database.prepare('SELECT * FROM scores WHERE testcase=? AND user=? LIMIT 1').get(problem.testcase_id, user.id)
        scores.push({
          problem: problemIndex,
          testcase: testcaseIndex,
          code: score ? score.code : '',
          language: score ? score.language : '',
          output: score ? score.output : '',
          score: score ? score.score : 0
        })
      }
    }
  }

  return { result, scores }
}

module.exports = { parseQuiz }
