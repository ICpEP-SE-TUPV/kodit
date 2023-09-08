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

import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import Logout from './pages/Logout';
import Homepage from './pages/Homepage';
import Playground from './pages/Playground';
import QuizNew from './pages/QuizNew';
import QuizView from './pages/QuizView';
import QuizEdit from './pages/QuizEdit';
import ProblemView from './pages/ProblemView';
import './styles/default.scss';

const App: React.FC = () => {
  return (
    <Routes>
      <Route index element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/signout" element={<Logout />} />

      <Route path="/home" element={<Homepage />} />

      <Route path="/quiz">
        <Route index element={<QuizNew />} />

        <Route path="/quiz/:quizCode">
          <Route index element={<QuizView />} />
          <Route path="/quiz/:quizCode/edit" element={<QuizEdit />} />
          <Route path="/quiz/:quizCode/problem/:problemNo" element={<ProblemView />} />
        </Route>
      </Route>

      <Route path="/playground" element={<Playground />} />
    </Routes>
  );
}

export default App;
