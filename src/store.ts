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

import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './reducers/theme';
import notificationsReducer from './reducers/notifications';
import userReducer from './reducers/user';

const store = configureStore({
  reducer: {
    theme: themeReducer,
    notifications: notificationsReducer,
    user: userReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export default store;
