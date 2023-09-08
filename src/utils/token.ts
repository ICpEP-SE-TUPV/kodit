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

import axios from 'axios';
import type { Dispatch, AnyAction } from '@reduxjs/toolkit';

import { apiUrl } from '../variables';
import { setUser } from '../reducers/user';
import { notify } from '../reducers/notifications';

export function parseToken (token: string) {
  const parts = token.split('.');
  return JSON.parse(atob(parts[1]));
}

export async function refreshToken (oldToken: string, dispatch: Dispatch<AnyAction>) {
  const fetchRes = await axios.post(`${apiUrl}/user`, {}, {
    headers: { Authorization: `Bearer ${oldToken}` }
  });

  const { success, message, token } = fetchRes.data;
  if (success) {
    dispatch(setUser(token));
  } else {
    dispatch(notify({
      title: 'Error',
      message,
      icon: 'bug'
    }));
  }
};
