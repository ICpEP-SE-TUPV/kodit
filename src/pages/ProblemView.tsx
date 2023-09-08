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

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';

import { homepage } from './navigation/default';
import { useToken } from '../hooks/token';
import { notify } from '../reducers/notifications';
import type { Quiz, Score } from '../types';
import { apiUrl } from '../variables';
import Page from '../components/Page';
import ProblemViewOwner from './ProblemViewOwner';
import ProblemViewLearner from './ProblemViewLearner';
import '../styles/pages/ProblemView.scss';

const ProblemView: React.FC = () => {
  const { quizCode, problemNo } = useParams();
  const [searchParams] = useSearchParams();
  const { token, payload } = useToken();
  const dispatch = useDispatch();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [scores, setScores] = useState<Score[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const username = searchParams.get('username');

    axios.get(`${apiUrl}/quiz/${quizCode}?username=${username || ''}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal
    }).then(quizRes => {
      const { success, message, quiz, scores } = quizRes.data;
      if (!success) throw new Error(message);

      setQuiz(quiz);
      setScores(scores);
    }).catch(error => {
      if (error.code === 'ERR_CANCELED') return;
      dispatch(notify({
        title: 'Error',
        message: error.message,
        icon: 'bug'
      }));
    });

    return () => controller.abort();
  }, [searchParams, quizCode, problemNo, token, dispatch]);

  const problemIndex = useMemo(() => parseInt(problemNo || '1') - 1, [problemNo]);

  return (
    <Page activeKey="/home" navs={homepage} className="py-4">
      { quiz !== null && payload !== null && (quiz.username === payload.username
        ? <ProblemViewOwner quiz={quiz} problemIndex={problemIndex} scores={scores} key={problemIndex} />
        : <ProblemViewLearner quiz={quiz} problemIndex={problemIndex} scores={scores} key={problemIndex} />)
      }
    </Page>
  );
};

export default ProblemView;
