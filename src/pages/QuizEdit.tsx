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
import { useNavigate, useParams } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import axios from 'axios';

import { notify } from '../reducers/notifications';
import { apiUrl } from '../variables';
import { useToken } from '../hooks/token';
import { handleInput, handleNumber, handleCheck } from '../utils/handlers';
import type { Quiz, Testcase } from '../types';
import { homepage } from './navigation/default';
import Page from '../components/Page';
import Editor from '../components/Editor';
import BootstrapIcon from '../components/BootstrapIcon';
import Pagination from '../components/Pagination';
import '../styles/pages/QuizNew.scss';

interface TestcaseError {
  index: number;
  message: string;
};

const QuizEdit: React.FC = () => {
  const { token } = useToken();
  const { quizCode } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [active, setActive] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [quizError, setQuizError] = useState<string>('');
  const [testcaseError, setTestcaseError] = useState<TestcaseError | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [nameView, setNameView] = useState<boolean>(true);

  const continueQuiz = useCallback(() => {
    if (quiz === null) return;

    if (name === '') {
      setError('Name is required');
      return;
    }

    setQuiz({
      ...quiz,
      name,
      description,
      startDate,
      endDate
    });
    setNameView(false);
  }, [quiz, name, description, startDate, endDate]);

  const handleProblem = useCallback((event: React.ChangeEvent) => {
    if (quiz === null) return;

    const target = event.target as HTMLTextAreaElement;
    const value = target.value;
    const copy = { ...quiz };
    copy.problems[active].problem = value;
    setQuiz(copy);
  }, [quiz, active]);

  const addTestcase = useCallback(() => {
    if (quiz === null) return;

    const copy = { ...quiz };
    copy.problems[active].testcases.push({
      expectedOutput: '',
      points: 0,
      hidden: false,
      inputs: '',
      inputsInterval: 2000
    });

    setQuiz(copy);
  }, [quiz, active]);

  const removeTestcase = useCallback((index: number) => {
    if (quiz === null) return;

    const copy = { ...quiz };
    const testcases = copy.problems[active].testcases;
    return () => {
      const modified: Testcase[] = [];
      for (let i = 0; i < testcases.length; i++) {
        if (i === index) continue;
        modified.push(testcases[i]);
      }

      copy.problems[active].testcases = modified;
      setQuiz(copy);
    };
  }, [quiz, active]);

  const updateTestcase = useCallback(<T extends keyof Testcase>(index: number, property: T) => {
    return (value: Testcase[T]) => {
      if (quiz === null) return;
      const copy = { ...quiz };
      copy.problems[active].testcases[index][property] = value;
      setQuiz(copy);
    };
  }, [quiz, active]);

  const addProblem = useCallback(() => {
    if (quiz === null) return;

    const copy = { ...quiz };
    copy.problems.push({
      problem: '',
      testcases: []
    });

    setQuiz(copy);
    setActive(active + 1);
    setQuizError('');
    setTestcaseError(null);
  }, [quiz, active]);

  const removeProblem = useCallback(() => {
    if (quiz === null || quiz.problems.length === 1) return;

    const copy = { ...quiz };
    const problems = [];
    const length = quiz.problems.length;
    for (let i = 0; i < length; i++) {
      if (i === active) continue;
      problems.push(quiz.problems[i]);
    }

    copy.problems = problems;
    setQuiz(copy);
    setActive(active - (active === length - 1 ? 1 : 0));
    setQuizError('');
    setTestcaseError(null);
  }, [quiz, active]);

  const submitQuiz = useCallback(async () => {
    if (quiz === null) return;

    setQuizError('');
    setTestcaseError(null);

    for (let i = 0; i < quiz.problems.length; i++) {
      const problem = quiz.problems[i];
      if (problem.problem === '') {
        setQuizError('Problem details are required');
        setActive(i);
        return;
      }

      const points = problem.testcases.reduce((accumulator, testcase) => accumulator + testcase.points, 0);
      if (points <= 0) {
        setQuizError('Problem has 0 points; please add a testcase');
        setActive(i);
        return;
      }

      for (let j = 0; j < problem.testcases.length; j++) {
        const testcase = problem.testcases[j];
        if (testcase.expectedOutput === '') {
          setTestcaseError({
            index: j,
            message: 'Expected output is empty'
          });
          setActive(i);
          return;
        }

        if (!testcase.points) {
          setTestcaseError({
            index: j,
            message: 'Points is 0'
          });
          setActive(i);
          return;
        }

        if (!testcase.inputsInterval) {
          setTestcaseError({
            index: j,
            message: 'Input interval is 0'
          });
          setActive(i);
          return;
        }
      }
    }

    setSubmitting(true);

    const submitRes = await axios.post(`${apiUrl}/quiz/${quiz.code}`, { quiz }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const { success, message } = submitRes.data;
    if (success) {
      navigate(`/quiz/${quiz.code}`);
    } else {
      setSubmitting(false);
      dispatch(notify({
        title: 'Error',
        message,
        icon: 'x-lg'
      }));
    }
  }, [token, quiz, dispatch, navigate]);

  const totalPoints = useMemo<number>(() => {
    if (quiz === null) return 0;

    const otherPoints = quiz.problems.reduce((accumulator, problem, i) => {
      if (i === active) return accumulator;
      return accumulator + problem.testcases.reduce((accumulator2, testcase) => {
        return accumulator2 + testcase.points;
      }, 0);
    }, 0);

    const testcases = quiz.problems[active].testcases;
    const currentPoints = testcases.reduce((accumulator, testcase) => accumulator + testcase.points, 0);
    return currentPoints + otherPoints;
  }, [quiz, active]);

  const nProblems = useMemo<number>(() => {
    return quiz !== null ? quiz.problems.length : 0;
  }, [quiz]);

  const setPaginationActive = useCallback((index: number) => {
    if (quiz === null) return;

    setQuizError('');
    setTestcaseError(null);
    setActive(index);
  }, [quiz]);

  useEffect(() => {
    const controller = new AbortController();
    axios.get(`${apiUrl}/quiz/${quizCode}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal
    }).then(listRes => {
      const { success, message, quiz } = listRes.data;
      if (!success) throw new Error(message);

      setName(quiz.name);
      setDescription(quiz.description);
      setStartDate(quiz.startDate || '');
      setEndDate(quiz.endDate || '');
      setQuiz(quiz);
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
  }, [token, quizCode, dispatch]);

  return (
    <Page activeKey="/" navs={homepage} className="py-4">
      { nameView && (
        <Container className="col-12 col-sm-9 col-md-6 col-lg-5 col-xl-3">
          <Card className="mx-auto">
            <Card.Body>
              <Card.Title>Create new quiz</Card.Title>

              <Form.Group controlId="quizzes-name" className="mb-3">
                <Form.Label>Quiz Name:</Form.Label>
                <Form.Control type="text" value={name} placeholder="Quiz Name" onChange={handleInput(setName)} required />
              </Form.Group>

              <Form.Group controlId="quizzes-description" className="mb-3">
                <Form.Label>Description:</Form.Label>
                <Form.Control as="textarea" value={description} placeholder="Quiz Description" rows={4} onChange={handleInput(setDescription)} />
              </Form.Group>

              <Row>
                <Col xs="12" sm="6">
                  <Form.Group controlId="quizzes-start-date" className="mb-3">
                    <Form.Label>Start Date:</Form.Label>
                    <Form.Control type="datetime-local" value={startDate} onChange={handleInput(setStartDate)} />
                  </Form.Group>
                </Col>

                <Col xs="12" sm="6">
                  <Form.Group controlId="quizzes-end-date" className="mb-3">
                    <Form.Label>End Date:</Form.Label>
                    <Form.Control type="datetime-local" value={endDate} onChange={handleInput(setEndDate)} />
                  </Form.Group>
                </Col>
              </Row>

              { error !== '' && <Alert variant="danger">{ error }</Alert> }

              <div className="d-flex justify-content-end">
                <LinkContainer to="/">
                  <Button variant="danger" type="button" className="me-2">Cancel</Button>
                </LinkContainer>

                <Button variant="primary" type="button" className="d-flex align-items-center" onClick={continueQuiz}>
                  <BootstrapIcon icon="arrow-right-short" width={24} height={24} className="me-1" />
                  <span>Continue</span>
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Container>
      ) }

      { !nameView && quiz !== null && (
        <Container>
          <Card className="mb-4">
            <Card.Header>Quiz Title: <strong>{ quiz.name }</strong></Card.Header>
            <Card.Body>
              <Row>
                <Col xs="12" sm="8">
                  <pre className="quiz-description">{ description }</pre>
                </Col>

                <Col xs="12" sm="4">
                  <div>Total Points: <strong>{ totalPoints }</strong></div>
                  <div>Number of problems: <strong>{ nProblems }</strong></div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Row>
            <Col md="12" lg="6">
              <Alert variant="info">You can use this editor to code and copy the expected output.</Alert>
              <Editor token={token} />
            </Col>

            <Col md="12" lg="6">
              <Pagination count={quiz.problems.length} active={active} limit={1} className="mb-2" setActive={setPaginationActive} />

              <Card className="mb-3">
                <Card.Body>
                  <Form.Group controlId="quiz-problem" className="mb-3">
                    <Form.Label>Problem:</Form.Label>
                    <Form.Control as="textarea" value={quiz.problems[active].problem} placeholder="Problem details" rows={6} onChange={handleProblem} required />
                  </Form.Group>

                  { quizError !== '' && <Alert variant="danger">{ quizError }</Alert> }
                </Card.Body>
              </Card>

              <div className="quizzes-testcases d-flex align-items-center justify-content-between mb-2">
                <h4>Testcases</h4>
                <Button variant="primary" type="button" onClick={addTestcase}>Add testcase</Button>
              </div>

              { quiz.problems[active].testcases.length === 0 &&
                <Alert variant="warning">
                  <BootstrapIcon icon="exclamation-triangle" width={24} height={24} className="me-2" />
                  <span>No testcases for this problem</span>
                </Alert>
              }

              { quiz.problems[active].testcases.map((testcase, i) => (
                <Card className="mb-2" key={i}>
                  <Card.Body>
                    <Row>
                      <Col xs="12" sm="8">
                        <Form.Group controlId={`testcase-output-${i}`} className="mb-3">
                          <Form.Label>Expected Output:</Form.Label>
                          <Form.Control as="textarea" value={testcase.expectedOutput} placeholder="Testcase expected output" rows={4} onChange={handleInput(updateTestcase(i, 'expectedOutput'))} required />
                        </Form.Group>

                        <Form.Group controlId={`testcase-input-${i}`} className="mb-3">
                          <Form.Label>Inputs:</Form.Label>
                          <Form.Control as="textarea" value={testcase.inputs} placeholder="Inputs to simulate" rows={4} onChange={handleInput(updateTestcase(i, 'inputs'))} />
                        </Form.Group>
                      </Col>

                      <Col xs="12" sm="4">
                        <Form.Group controlId={`testcase-points-${i}`} className="mb-3">
                          <Form.Label>Points:</Form.Label>
                          <Form.Control type="number" value={testcase.points || ''} onChange={handleNumber(updateTestcase(i, 'points'))} required />
                        </Form.Group>

                        <Form.Group controlId={`testcase-inputs-interval-${i}`} className="mb-3">
                          <Form.Label>Inputs interval (ms):</Form.Label>
                          <Form.Control type="number" value={testcase.inputsInterval || ''} onChange={handleNumber(updateTestcase(i, 'inputsInterval'))} required />
                        </Form.Group>

                        <Form.Group controlId={`testcase-hidden-${i}`} className="mb-3">
                          <Form.Check checked={testcase.hidden} label="Hidden testcase?" onChange={handleCheck(updateTestcase(i, 'hidden'))} />
                        </Form.Group>

                        <div className="d-grid">
                          <Button variant="danger" size="sm" type="button" className="d-flex align-items-center me-2" onClick={removeTestcase(i)}>
                            <BootstrapIcon icon="x-circle" className="me-1" />
                            <span>Remove testcase</span>
                          </Button>
                        </div>
                      </Col>
                    </Row>

                    { testcaseError !== null && testcaseError.index === i && <Alert variant="danger">{ testcaseError.message }</Alert> }
                  </Card.Body>
                </Card>
              )) }

              <div className="d-flex justify-content-end mt-4">
                <Button variant="danger" type="button" className="d-flex align-items-center me-2" onClick={removeProblem}>
                  <BootstrapIcon icon="trash" width={18} height={18} className="me-1" />
                  <span>Delete problem</span>
                </Button>

                <Button variant="secondary" type="button" className="d-flex align-items-center me-2" onClick={addProblem}>
                  <BootstrapIcon icon="plus" width={18} height={18} className="me-1" />
                  <span>Add problem</span>
                </Button>

                <Button variant="success" type="button" className="d-flex align-items-center" disabled={submitting} onClick={submitQuiz}>
                  <BootstrapIcon icon="send" width={18} height={18} className="me-1" />
                  <span>{ submitting ? 'Submitting...' : 'Submit' }</span>
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      ) }
    </Page>
  );
};

export default QuizEdit;
