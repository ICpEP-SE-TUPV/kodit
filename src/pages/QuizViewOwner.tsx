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

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { LinkContainer } from 'react-router-bootstrap';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import axios from 'axios';

import type { Quiz, QuizStatus, Score, SubmissionStatus } from '../types';
import { apiUrl } from '../variables';
import { useToken } from '../hooks/token';
import { notify } from '../reducers/notifications';
import { percentText } from '../utils/text';
import QuizCard from '../components/QuizCard';
import BootstrapIcon from '../components/BootstrapIcon';

export interface QuizViewOwnerProps {
  quiz: Quiz;
  scores: Score[];
}

interface StudentScore {
  name: string;
  score: number;
}

type Students = { [key:string]: StudentScore };

const QuizViewOwner: React.FC<QuizViewOwnerProps> = (props: QuizViewOwnerProps) => {
  const { quiz, scores } = props;
  const { token } = useToken();
  const dispatch = useDispatch();
  const [submissions, setSubmissions] = useState<SubmissionStatus[]>([]);

  const quizStatus = useMemo<QuizStatus>(() => {
    const now = Date.now();
    const startDate = quiz.startDate ? new Date(quiz.startDate) : null;
    const endDate = quiz.endDate ? new Date(quiz.endDate) : null;

    if (endDate !== null) {
      const endTime = endDate.getTime();
      if (now > endTime) return 'closed';
    }

    if (startDate !== null) {
      const startTime = startDate.getTime();
      if (now < startTime) return 'not-started';
    }

    return 'started';
  }, [quiz]);

  const quizStatusText = useMemo<string>(() => {
    if (quizStatus === 'closed') return 'Closed';
    if (quizStatus === 'not-started') return 'Not Started';
    if (quizStatus === 'started') return 'Started';
    return 'Unknown';
  }, [quizStatus]);

  const totalPoints = useMemo(() => quiz.problems.reduce((accumulator, problem, i) => {
    return accumulator + problem.testcases.reduce((accumulator2, testcase) => {
      return accumulator2 + testcase.points;
    }, 0);
  }, 0), [quiz]);

  const inviteLink = useMemo(() => `${window.location.origin}/quiz/${quiz.code}`, [quiz.code]);

  const cards = useMemo<React.ReactNode[]>(() => {
    const students: Students = {};
    for (let i = 0; i < scores.length; i++) {
      const score = scores[i];
      if (typeof students[score.username] === 'undefined') {
        students[score.username] = {
          name: score.name,
          score: score.score
        };
      } else {
        students[score.username].score += score.score;
      }
    }

    const nodes: React.ReactNode[] = [];
    let i = 0;

    for (const key in students) {
      if (!students.hasOwnProperty(key)) continue;

      const submitted = submissions.map(submission => submission?.username).includes(key);
      const to = {
        pathname: `/quiz/${quiz.code}/problem/1`,
        search: `?username=${key}`
      };

      nodes.push(
        <LinkContainer to={to} key={key}>
          <Card key={i} className="mb-2 clickable">
            <Card.Body>
              <Row>
                <Col xs="12" sm="8">{ students[key].name } (@{ key })</Col>
                <Col xs="12" sm="2">
                  <div className={`d-flex align-items-center ${percentText(students[key].score / totalPoints)}`}>
                    <BootstrapIcon icon="award" className="me-1" />
                    <span>{ students[key].score } / { totalPoints }</span>
                  </div>
                </Col>
                <Col xs="12" sm="2" className={ submitted ? 'text-success' : 'text-danger' }>
                  <BootstrapIcon icon={ submitted ? 'check' : 'hourglass-split' } className="me-1" />
                  <span>{ submitted ? 'Submitted' : 'Waiting for submission' }</span>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </LinkContainer>
      );
      i++;
    }

    return nodes;
  }, [quiz.code, submissions, scores, totalPoints]);

  useEffect(() => {
    const controller = new AbortController();
    axios.get(`${apiUrl}/quiz/${quiz.code}/submissions`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal
    }).then(res => {
      const { success, message, submissions } = res.data;
      if (!success) throw new Error(message);

      setSubmissions(submissions);
    }).catch(error => {
      if (error.code === 'ERR_CANCELED') return;
      dispatch(notify({
        title: 'Error',
        message: error.message,
        icon: 'bug',
        closeAfter: 5000
      }));
    });

    return () => controller.abort();
  }, [token, quiz.code, dispatch]);

  const copy = useCallback((text: string) => async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {}
  }, []);

  return (
    <Container>
      <Row>
        <Col sm="12" md="4" lg="3">
          <div className="mb-2">Quiz Status: <strong>{ quizStatusText }</strong></div>
          <QuizCard quiz={quiz} displayDates={true} className="mb-3" />

          <Card className="mb-3 mb-sm-0">
            <Card.Body>
              <Card.Title>Students Invite</Card.Title>
              <div>
                <span>Quiz Code:</span>
                <InputGroup className="mb-2">
                  <Form.Control type="text" value={quiz.code} readOnly />
                  <Button variant="secondary" type="button" className="btn-icon" onClick={copy(quiz.code || '')}>
                    <BootstrapIcon icon="clipboard" />
                  </Button>
                </InputGroup>

                <span>Invite Link:</span>
                <InputGroup>
                  <Form.Control type="text" value={inviteLink} readOnly />
                  <Button variant="secondary" type="button" className="btn-icon" onClick={copy(inviteLink)}>
                    <BootstrapIcon icon="clipboard" />
                  </Button>
                </InputGroup>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col sm="12" md="8" lg="9">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h5>Students</h5>

            <LinkContainer to={`/quiz/${quiz.code}/edit`}>
              <Button variant="primary" type="button" className="d-flex align-items-center">
                <BootstrapIcon icon="pencil-square" className="me-1" />
                <span>Edit Quiz</span>
              </Button>
            </LinkContainer>
          </div>

          { cards.length === 0 && <Alert variant="info">Invite your students and see their scores here!</Alert> }

          { cards }
        </Col>
      </Row>
    </Container>
  );
};

export default QuizViewOwner;
