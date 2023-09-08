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

import React, { useMemo } from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import type { Quiz } from '../types';
import { apiUrl } from '../variables';
import { formatDate } from '../utils/date';
import BootstrapIcon from './BootstrapIcon';
import '../styles/components/QuizCard.scss';

export interface QuizCardProps {
  quiz: Quiz;
  score?: number;
  className?: string;
  displayDates?: boolean;
}

const QuizCard: React.FC<QuizCardProps> = (props: QuizCardProps) => {
  const { quiz, score, className = '', displayDates } = props;

  const totalPoints = useMemo(() => quiz.problems.reduce((accumulator, problem, i) => {
    return accumulator + problem.testcases.reduce((accumulator2, testcase) => {
      return accumulator2 + testcase.points;
    }, 0);
  }, 0), [quiz]);

  const hasScore = useMemo(() => typeof score === 'number', [score]);

  return (
    <LinkContainer to={`/quiz/${quiz.code}`}>
      <Card className={`quiz-card ${className}`.trim()}>
        <Card.Img variant="top" src={`${apiUrl}/quiz/${quiz.code}/image`} height={175} />
        <Card.Body className="d-flex flex-column">
          <Card.Title>{ quiz.name }</Card.Title>
          <Card.Text className="flex-fill">{ quiz.description }</Card.Text>

          { displayDates && (quiz.startDate || quiz.endDate) &&
            <Card.Text as="div">
              { quiz.startDate &&
                <div className="d-flex">
                  <div className="flex-fill">Date Start:</div>
                  <span>{ formatDate(quiz.startDate) }</span>
                </div>
              }

              { quiz.endDate &&
                <div className="d-flex">
                  <div className="flex-fill">Date End:</div>
                  <span>{ formatDate(quiz.endDate) }</span>
                </div>
              }
            </Card.Text>
          }

          <hr />
          <Row>
            <Col xs="12" sm={ hasScore ? '4' : '6' } className="text-center px-1">
              <strong className="fs-4">{ quiz.problems.length }</strong>
              <div>
                <BootstrapIcon icon="journal-code" className="me-1" />
                <small>Problems</small>
              </div>
            </Col>

            <Col xs="12" sm={ hasScore ? '4' : '6' } className="text-center px-1">
              <strong className="fs-4">{ totalPoints }</strong>
              <div>
                <BootstrapIcon icon="award" className="me-1" />
                <small>Total { !hasScore && 'Points' }</small>
              </div>
            </Col>

            { hasScore &&
              <Col xs="12" sm="4" className="text-center px-1">
                <strong className="fs-4">{ score }</strong>
                <div>
                  <BootstrapIcon icon="trophy" className="me-1" />
                  <small>Earned { !hasScore && 'Points' }</small>
                </div>
              </Col>
            }
          </Row>
        </Card.Body>
      </Card>
    </LinkContainer>
  );
};

export default QuizCard;
