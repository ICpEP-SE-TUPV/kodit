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

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import axios from 'axios';
import type { AxiosResponse } from 'axios';

import type { Quiz, LanguageValue, Score } from '../types';
import type { RootState } from '../store';
import { apiUrl } from '../variables';
import { notify } from '../reducers/notifications';
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

const ProblemViewLearner: React.FC<ProblemViewLearnerProps> = (props: ProblemViewLearnerProps) => {
  const { quiz, problemIndex, scores: scoresProp } = props;
  const { token } = useToken();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme } = useSelector((state: RootState) => state.theme);
  const [modalFinishShow, setModalFinishShow] = useState<boolean>(false);
  const [code, setCode] = useState<string>('');
  const [language, setLanguage] = useState<LanguageValue>('cpp');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitRender, setSubmitRender] = useState<number>(1);
  const scoresRef = useRef(scoresProp);
  const testcasesLoadRef = useRef<boolean[]>([]);

  const disabledSubmit = useMemo(() => submitRender > 0 && (submitting || testcasesLoadRef.current.filter(load => load).length > 0), [submitting, submitRender]);
  const problem = useMemo(() => quiz.problems[problemIndex], [quiz.problems, problemIndex]);
  const correct = useMemo(() => scoresRef.current.filter(score => submitRender > 0 && score.problem === problemIndex && score.score > 0).length, [problemIndex, submitRender]);
  const totalTestcases = useMemo(() => scoresRef.current.filter(score => score.problem === problemIndex).length, [problemIndex]);
  const earned = useMemo(() => submitRender ? scoresRef.current.reduce((accumulator, score) => accumulator + score.score, 0) : 0, [submitRender]);
  const totalPoints = useMemo(() => quiz.problems.reduce((accumulator, problem) => {
    return accumulator + problem.testcases.reduce((accumulator2, testcase) => {
      return accumulator2 + testcase.points;
    }, 0);
  }, 0), [quiz]);

  const defaultLanguage = useMemo(() => scoresRef.current.filter(score => score.problem === problemIndex)[0].language, [problemIndex]);
  const defaultCode = useMemo(() => scoresRef.current.filter(score => score.problem === problemIndex)[0].code, [problemIndex]);

  const setActive = useCallback((index: number) => {
    navigate(`/quiz/${quiz.code}/problem/${index + 1}`);
  }, [quiz.code, navigate]);

  const loadAll = useCallback((value: boolean = false) => {
    const array = new Array<boolean>(problem.testcases.length);
    array.fill(value, 0, problem.testcases.length);
    testcasesLoadRef.current = array;
    setSubmitRender(render => render + 1);
  }, [problem.testcases.length]);

  const handleData = useCallback((res: AxiosResponse<any, any>) => {
    const { success, message, score, output } = res.data;
    if (!success) throw new Error(message);

    const data = JSON.parse(res.config.data);
    const i = data.testcase;
    let scoreIndex = 0;
    for (let j = 0; j < scoresRef.current.length; j++) {
      const score = scoresRef.current[j];
      if (score.problem === problemIndex) {
        if (scoreIndex === i) {
          scoreIndex = j;
          break;
        }
        scoreIndex++
      }
    }

    scoresRef.current[scoreIndex].code = code;
    scoresRef.current[scoreIndex].language = language;
    scoresRef.current[scoreIndex].score = score;
    scoresRef.current[scoreIndex].output = output;
    testcasesLoadRef.current[i] = false;
    setSubmitRender(render => render + 1)
  }, [code, language, problemIndex]);

  const handleError = useCallback((error: any) => {
    dispatch(notify({
      title: 'Error',
      message: error.message,
      icon: 'bug'
    }));
  }, [dispatch]);

  const submitCode = useCallback(() => {
    loadAll(true);
    setSubmitting(true);

    for (let i = 0; i < problem.testcases.length; i++) {
      axios.post(`${apiUrl}/quiz/${quiz.code}/${problemIndex}`, { testcase: i, code, language }, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(handleData).catch(handleError);
    }

    setSubmitting(false);
  }, [quiz, problemIndex, problem.testcases, code, language, token, handleData, handleError, loadAll]);

  const finishQuiz = useCallback(async () => {
    const res = await axios.post(`${apiUrl}/quiz/${quiz.code}/submission`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const { success, message } = res.data;
    if (success) {
      navigate(`/quiz/${quiz.code}`);
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

  useEffect(() => {
    loadAll();
  }, [loadAll]);

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

            <Button variant="success" type="button" className="btn-icon" onClick={handleModalFinishShow}>
              <BootstrapIcon icon="clipboard-check" className="me-2" />
              <span>Finish</span>
            </Button>
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
            const filtered = scoresRef.current.filter(score => score.problem === problemIndex && score.testcase === i);
            let score = 0
            let output = ''

            if (filtered.length > 0) {
              score = filtered[0].score;
              output = filtered[0].output;
            }

            const textColor = percentText(score / testcase.points);
            return testcase.hidden ? (
              <Card className="mb-3" key={i}>
                <Card.Body>
                  <div className="d-flex align-items-center justify-content-between">
                    <strong>Hidden Testcase</strong>
                    <div className="d-flex align-items-center">
                      <div className={`${textColor} me-2`.trim()}>Points: { score } / { testcase.points }</div>
                      { testcasesLoadRef.current[i] && <Spinner size="sm" /> }
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ) : (
              <Card className="mb-3" key={i}>
                <Card.Body>
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <strong>Expected Output:</strong>
                    { testcasesLoadRef.current[i] && <Spinner size="sm" /> }
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

            <Button variant="primary" type="button" className="d-flex align-items-center" onClick={submitCode} disabled={disabledSubmit}>
              <BootstrapIcon icon="send" className="me-2" />
              <span>{ disabledSubmit ? 'Submitting...' : 'Submit' }</span>
            </Button>
          </div>

          <Editor token={token} hideCopy={true} defaultLanguage={defaultLanguage} defaultCode={defaultCode} codeChange={setCode} languageChange={setLanguage} />
        </Col>
      </Row>

      <Modal show={modalFinishShow} onHide={handleModalFinishClose} data-bs-theme={theme}>
        <Modal.Body>
          <h5 className="mb-3">Submit quiz?</h5>

          <Alert variant="info">
            <strong><BootstrapIcon icon="info-circle" className="me-1" /> Note:</strong> <span>You won't be able to edit your answers.</span>
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

export default ProblemViewLearner;
