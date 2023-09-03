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

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type Theme = 'dark' | 'light';

export interface ThemeState {
  theme: Theme;
}

const theme = localStorage.getItem('theme') as Theme || 'dark';
const initialState: ThemeState = { theme };
export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    updateTheme: (state, action: PayloadAction<Theme>) => {
      localStorage.setItem('theme', action.payload);
      state.theme = action.payload;
    }
  }
});

export const { updateTheme } = themeSlice.actions;
export default themeSlice.reducer;
