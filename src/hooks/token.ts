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

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

import type { RootState } from "../store";
import type { JWTPayload } from "../types";
import { parseToken, refreshToken } from "../utils/token";

export function useToken () {
  const { token, payload } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (token !== '') return;

    const next = encodeURIComponent(location.pathname);
    navigate(`/?next=${next}`);
  }, [token, navigate, location]);

  useEffect(() => {
    if (token === '') return;

    const payload = parseToken(token) as JWTPayload;
    const expires = payload.exp * 1000;
    const now = Date.now();
    if (expires - now < 3600000) refreshToken(token, dispatch);
  }, [token, dispatch]);

  return { token, payload };
}
