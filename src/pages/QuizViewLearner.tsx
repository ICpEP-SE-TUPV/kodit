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

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import axios from 'axios';

import type { Quiz, QuizStatus, Score, SubmissionStatus } from '../types';
import type { RootState } from '../store';
import { apiUrl } from '../variables';
import { useToken } from '../hooks/token';
import { notify } from '../reducers/notifications';
import { percentText } from '../utils/text';
import { formatDate } from '../utils/date';
import BootstrapIcon from '../components/BootstrapIcon';
import QuizCard from '../components/QuizCard';

export interface QuizViewLearnerProps {
  quiz: Quiz;
  scores: Score[];
}

const QuizViewLearner: React.FC<QuizViewLearnerProps> = (props: QuizViewLearnerProps) => {
  const { quiz, scores } = props;
  const { token } = useToken();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme } = useSelector((state: RootState) => state.theme);
  const [submission, setSubmission] = useState<SubmissionStatus>(null);
  const [modalFinishShow, setModalFinishShow] = useState<boolean>(false);

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

  const earnedPoints = useMemo(() => scores.reduce((accumulator, score) => accumulator + score.score, 0), [scores]);

  const totalPoints = useMemo(() => quiz.problems.reduce((accumulator, problem) => {
    return accumulator + problem.testcases.reduce((accumulator2, testcase) => {
      return accumulator2 + testcase.points;
    }, 0);
  }, 0), [quiz]);

  const lastProblem = useMemo(() => {
    let index = 0;
    for (let i = 0; i < quiz.problems.length; i++) {
      const earned = scores.filter(score => score.problem === i).reduce((accumulator, score) => accumulator + score.score, 0);
      if (earned === 0) {
        index = i;
        break;
      }
    }

    return index + 1;
  }, [quiz.problems, scores]);

  useEffect(() => {
    const controller = new AbortController();
    axios.get(`${apiUrl}/quiz/${quiz.code}/submission`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal
    }).then(res => {
      const { success, message, submission} = res.data;
      if (!success) throw new Error(message);

      setSubmission(submission);
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
  }, [token, quiz, dispatch]);

  const finishQuiz = useCallback(async () => {
    const res = await axios.post(`${apiUrl}/quiz/${quiz.code}/submission`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const { success, message } = res.data;
    if (success) {
      navigate(0);
    } else {
      dispatch(notify({
        title: 'Error',
        message,
        icon: 'bug',
        closeAfter: 5000
      }));
    }
  }, [token, quiz.code, dispatch, navigate]);

  const handleModalFinishShow = useCallback(() => {
    setModalFinishShow(true);
  }, []);

  const handleModalFinishClose = useCallback(() => {
    setModalFinishShow(false);
  }, []);

  return (
    <Container>
      <Row>
        <Col sm="12" md="4" lg="3">
          <div className="mb-2">Submission Status: <strong>{ submission !== null ? `Submitted at ${formatDate(submission.dateSubmitted)}` : 'Not yet submitted' }</strong></div>
          <QuizCard quiz={quiz} score={earnedPoints} displayDates={true} displayOwner={true} className="mb-3 mb-sm-0" />
        </Col>

        <Col sm="12" md="8" lg="9">
          { quizStatus === 'not-started' &&
            <Alert variant="info">
              <Alert.Heading className="d-flex align-items-center">
                <BootstrapIcon icon="hourglass-split" width={32} height={32} className="me-2" />
                <span>Not Yet Open</span>
              </Alert.Heading>
              <p>This quiz hasn't started yet and will open at { formatDate(quiz.startDate || '') }</p>
            </Alert>
          }

          { quizStatus === 'closed' &&
            <Alert variant="danger">
              <Alert.Heading className="d-flex align-items-center">
                <BootstrapIcon icon="x-circle-fill" width={32} height={32} className="me-2" />
                <span>Closed</span>
              </Alert.Heading>
              <p>This quiz was already closed.</p>
            </Alert>
          }

          { quizStatus === 'started' &&
            <React.Fragment>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5>Problems</h5>
                { submission === null &&
                  <div className="d-flex align-items-center">
                    <Button variant="success" type="button" className="btn-icon me-2" onClick={handleModalFinishShow}>
                      <BootstrapIcon icon="clipboard-check" className="me-1" />
                      <span>Finish</span>
                    </Button>

                    <LinkContainer to={`/quiz/${quiz.code}/problem/${lastProblem}`}>
                      <Button variant="primary" type="button" className="d-flex align-items-center">
                        <BootstrapIcon icon="play" className="me-1" />
                        <span>Start</span>
                      </Button>
                    </LinkContainer>
                  </div>
                }
              </div>

              { quiz.problems.map((problem, i) => {
                const earned = scores.filter(score => score.problem === i).reduce((acculumator, score) => acculumator + score.score, 0);
                const total = problem.testcases.reduce((accumulator, testcase) => accumulator + testcase.points, 0);

                return (
                  <LinkContainer to={`/quiz/${quiz.code}/problem/${i + 1}`} key={i}>
                    <Card className="quiz-card mb-3 clickable">
                      <Card.Body>
                        <Row>
                          <Col xs="12" sm="10">
                            <Card.Subtitle>{ problem.problem }</Card.Subtitle>
                          </Col>

                          <Col xs="12" sm="2">
                            <div className="d-flex align-items-center">
                              <BootstrapIcon icon="award" className="me-1" />
                              <span>{ earned } / { total }</span>
                            </div>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </LinkContainer>
                );
              }) }
            </React.Fragment>
          }

          <div className="d-flex align-items-center justify-content-end">
            <span className="me-3">Earned points:</span>
            <strong className={`fs-4 ${percentText(earnedPoints / totalPoints)}`}>{ earnedPoints } / { totalPoints }</strong>
          </div>
        </Col>
      </Row>

      <Modal show={modalFinishShow} onHide={handleModalFinishClose} data-bs-theme={theme}>
        <Modal.Body>
          <h5 className="mb-3">Submit quiz?</h5>

          { earnedPoints === 0 &&
            <Alert variant="danger">
              <h5 className="d-flex align-items-center">
                <BootstrapIcon icon="exclamation-triangle" width={20} height={20} className="me-2" />
                <span>Danger!</span>
              </h5>

              <div>Are you sure you want to submit with no points?</div>
            </Alert>
          }

          <Alert variant="info">
            <h5 className="d-flex align-items-center">
              <BootstrapIcon icon="info-circle" width={20} height={20} className="me-2" />
              <span>Note:</span>
            </h5>

            <div>You won't be able to edit your answers.</div>
          </Alert>

          <div className="d-flex align-items-center justify-content-end">
            <Button variant="danger" type="button" onClick={handleModalFinishClose} className="py-1 me-2">Close</Button>

            <Button variant="primary" type="button" className="btn-icon py-1" onClick={finishQuiz}>
              <BootstrapIcon icon="send" className="me-1" />
              <span>Submit</span>
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default QuizViewLearner;
