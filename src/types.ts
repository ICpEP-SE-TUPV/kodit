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

import { languages } from './variables';

export type UserType = 'student' | 'teacher';

export interface JWTPayload {
  exp: number;
  iat: number;
  iss: string;
  sub: string;
}

export interface UserPayload extends JWTPayload {
  id: string;
  type: UserType;
  username: string;
  name: string;
}

export interface Quiz {
  name: string;
  code?: string;
  description: string;
  username: string;
  startDate?: string;
  endDate?: string;
  problems: Problem[];
}

export type QuizStatus = 'not-started' | 'started' | 'closed';

export interface Problem {
  problem: string;
  testcases: Testcase[];
}

export interface Testcase {
  expectedOutput: string;
  points: number;
  hidden: boolean;
  inputs: string;
  inputsInterval: number;
}

export type Languages = typeof languages;
export type LanguageValue = keyof Languages;

export interface Score {
  problem: number;
  testcase: number;
  name: string;
  username: string;
  code: string;
  language: LanguageValue;
  output: string;
  score: number;
}

export interface Submission {
  username: string;
  quiz: string;
  dateSubmitted: string;
}

export type SubmissionStatus = Submission | null;
