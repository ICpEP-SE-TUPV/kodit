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

export function percentText (percent: number, showDanger = false) {
  let color = '';
  if (percent === 1) color = 'text-success';
  if (percent < 1 && percent > 0.5) color = 'text-warning';
  if (percent <= 0.5 && showDanger) color = 'text-danger';
  return color;
}
