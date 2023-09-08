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

import React, { useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import type { Quiz, Score } from '../types';
import { useToken } from '../hooks/token';
import { percentText } from '../utils/text';
import Editor from '../components/Editor';
import Pagination from '../components/Pagination';
import BootstrapIcon from '../components/BootstrapIcon';

export interface ProblemViewLearnerProps {
  quiz: Quiz;
  problemIndex: number;
  scores: Score[];
}

const ProblemViewOwner: React.FC<ProblemViewLearnerProps> = (props: ProblemViewLearnerProps) => {
  const { quiz, problemIndex, scores } = props;
  const { token } = useToken();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const username = useMemo(() => searchParams.get('username'), [searchParams]);
  const problem = useMemo(() => quiz.problems[problemIndex], [quiz.problems, problemIndex]);
  const correct = useMemo(() => scores.filter(score => score.problem === problemIndex && score.score > 0).length, [scores, problemIndex]);
  const totalTestcases = useMemo(() => scores.filter(score => score.problem === problemIndex).length, [scores, problemIndex]);
  const earned = useMemo(() => scores.reduce((accumulator, score) => accumulator + score.score, 0), [scores]);
  const totalPoints = useMemo(() => quiz.problems.reduce((accumulator, problem) => {
    return accumulator + problem.testcases.reduce((accumulator2, testcase) => {
      return accumulator2 + testcase.points;
    }, 0);
  }, 0), [quiz]);

  const defaultLanguage = useMemo(() => scores.filter(score => score.problem === problemIndex)[0].language, [scores, problemIndex]);
  const defaultCode = useMemo(() => scores.filter(score => score.problem === problemIndex)[0].code, [scores, problemIndex]);

  const setActive = useCallback((index: number) => {
    navigate(`/quiz/${quiz.code}/problem/${index + 1}?username=${username}`);
  }, [username, quiz.code, navigate]);

  return (
    <Container>
      <Row>
        <Col sm="12" md="4">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <LinkContainer to={`/quiz/${quiz.code}`}>
              <Button variant="danger" type="button" className="d-flex align-items-center">
                <BootstrapIcon icon="arrow-left" className="me-2" />
                <span>Back</span>
              </Button>
            </LinkContainer>
          </div>

          <Card className="mb-3">
            <Card.Header>
              <div>Quiz: <strong>{ quiz.name }</strong></div>
              <div className="d-flex align-items-center justify-content-between">
                <span>Total Points Earned:</span>
                <span className={`${percentText(earned / totalPoints)} fs-4`.trim()}>{ earned } / { totalPoints }</span>
              </div>
            </Card.Header>

            <Card.Body>
              <Card.Title>Problem:</Card.Title>
              <Card.Text as="div">
                <pre className="quiz-description">{ problem.problem }</pre>
              </Card.Text>
            </Card.Body>
          </Card>

          <div className="d-flex align-items-center justify-content-between mb-2">
            <h4>Testcases</h4>
            <div className={percentText(correct / totalTestcases)}>{ correct } / { totalTestcases }</div>
          </div>

          { quiz.problems[problemIndex].testcases.map((testcase, i) => {
            const filtered = scores.filter(score => score.problem === problemIndex && score.testcase === i);
            let score = 0
            let output = ''

            if (filtered.length > 0) {
              score = filtered[0].score;
              output = filtered[0].output;
            }

            const textColor = percentText(score / testcase.points);
            return (
              <Card className="mb-3" key={i}>
                <Card.Body>
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <strong>Expected Output:</strong>
                  </div>

                  <Card.Text className="program-output mb-2 p-2" as="div">
                    <pre>{ testcase.expectedOutput }</pre>
                  </Card.Text>

                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <strong>Your Output:</strong>
                    <div className={textColor}>Points: { score } / { testcase.points }</div>
                  </div>

                  <Card.Text className="program-output p-2" as="div">
                    <pre>{ output }</pre>
                  </Card.Text>
                </Card.Body>
              </Card>
            );
          }) }
        </Col>

        <Col sm="12" md="8">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <Pagination count={quiz.problems.length} active={problemIndex} limit={1} setActive={setActive} className="mb-0" />
          </div>

          <Alert variant="info">Viewing work of <strong>@{ username }</strong></Alert>

          <Editor token={token} hideCopy={true} defaultLanguage={defaultLanguage} defaultCode={defaultCode} />
        </Col>
      </Row>
    </Container>
  );
};

export default ProblemViewOwner;
