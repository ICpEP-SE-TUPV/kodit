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
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FormGroup from 'react-bootstrap/FormGroup';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import axios from 'axios';

import type { Quiz, Score } from '../types';
import type { RootState } from '../store';
import { apiUrl } from '../variables';
import { notify } from '../reducers/notifications';
import { homepage } from './navigation/default';
import { useToken } from '../hooks/token';
import { handleInput } from '../utils/handlers';
import Page from '../components/Page';
import Blankslate from '../components/Blankslate';
import BootstrapIcon from '../components/BootstrapIcon';
import Pagination from '../components/Pagination';
import QuizCard from '../components/QuizCard';
import '../styles/pages/Homepage.scss';

const PAGE_LIMIT = 8;

const Homepage: React.FC = () => {
  const { token, payload } = useToken();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme } = useSelector((state: RootState) => state.theme);
  const [query, setQuery] = useState<string>('');
  const [finalQuery, setFinalQuery] = useState<string>('');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [scores, setScores] = useState<Score[][]>([]);
  const [count, setCount] = useState<number>(0);
  const [active, setActive] = useState<number>(0);
  const [code, setCode] = useState<string>('');
  const [modalAddShow, setModalAddShow] = useState<boolean>(false);

  const pageOffset = useMemo(() => active * PAGE_LIMIT + 1, [active]);
  const pageLength = useMemo(() => pageOffset + quizzes.length - 1, [pageOffset, quizzes]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    const limit = PAGE_LIMIT;
    const offset = active * limit;
    params.set('query', finalQuery);
    params.set('offset', offset.toString());
    params.set('limit', limit.toString());

    axios.get(`${apiUrl}/quiz?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal
    }).then(listRes => {
      const { success, message, scores, results, count } = listRes.data;
      if (!success) throw new Error(message);

      setScores(scores);
      setQuizzes(results);
      setCount(count);
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
  }, [token, finalQuery, active, dispatch]);

  const handleQuery = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    setFinalQuery(query);
    setActive(0);
  }, [query]);

  const addQuiz = useCallback(() => {
    navigate(`/quiz/${code}`);
  }, [code, navigate]);

  const handleModalAddShow = useCallback(() => {
    setModalAddShow(true);
  }, []);

  const handleModalAddClose = useCallback(() => {
    setModalAddShow(false);
  }, []);

  return (
    <Page activeKey="/home" navs={homepage}>
      <div className="homepage-container py-5">
        <Container>
          <Row className="justify-content-between align-items-center mb-3">
            <Col xs="12" sm="12" md="6" xxl="8">
              <h4>Quizzes</h4>
            </Col>

            <Col xs="12" sm="12" md="6" xxl="4">
              <div className="d-flex align-items-center">
                <form action="" method="get" onSubmit={handleQuery} className="flex-fill me-2">
                  <InputGroup>
                    <Form.Control type="search" value={query} placeholder="Search query" onChange={handleInput(setQuery)} aria-label="Search query" aria-describedby="btn-search" />
                    <Button variant="success" id="btn-search" type="submit" className="d-flex align-items-center">
                      <BootstrapIcon icon="search" width={14} height={14} className="me-2" />
                      <span>Search</span>
                    </Button>
                  </InputGroup>
                </form>

                { payload?.type === 'teacher' &&
                  <LinkContainer to="/quiz">
                    <Button variant="primary" type="button">Create quiz</Button>
                  </LinkContainer>
                }

                { payload?.type === 'student' &&
                  <Button variant="primary" type="button" onClick={handleModalAddShow}>Add quiz</Button>
                }
              </div>
            </Col>
          </Row>

          { quizzes.length === 0 &&
            <Blankslate title="No results found!" subtitle="Make sure that you entered correct details" icon="rocket-takeoff-fill" />
          }

          <div className="homepage-quizzes mb-3">
            { quizzes.map((quiz, i) => {
              if (payload === null) return '';
              const earnedPoints = payload.type === 'student'
                ? scores[i].reduce((accumulator, score) => accumulator + score.score, 0)
                : undefined;

              return <QuizCard quiz={quiz} score={earnedPoints} className="mx-2 mb-3 clickable" key={i} />;
            }) }
          </div>

          <div className="d-flex justify-content-between align-items-center mx-3">
            <small>Showing { pageOffset } - { pageLength } of { count }</small>
            <Pagination count={count} active={active} limit={PAGE_LIMIT} className="justify-content-center" setActive={setActive} />
          </div>
        </Container>
      </div>

      <Modal show={modalAddShow} onHide={handleModalAddClose} data-bs-theme={theme}>
        <Modal.Body>
          <FormGroup controlId="homepage-add-quiz-code" className="mb-3">
            <Form.Label>Quiz Code:</Form.Label>
            <Form.Control type="text" name="code" value={code} placeholder="Quiz code" autoComplete="off" onChange={handleInput(setCode)} required />
          </FormGroup>

          <div className="d-flex align-items-center justify-content-end">
            <Button variant="danger" type="button" onClick={handleModalAddClose} className="py-1 me-2">Close</Button>

            <Button variant="primary" type="button" className="btn-icon py-1" onClick={addQuiz}>
              <BootstrapIcon icon="plus-lg" className="me-1" />
              <span>Submit</span>
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </Page>
  );
};

export default Homepage;
