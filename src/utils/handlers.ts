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

export function handleInput (setter: React.Dispatch<React.SetStateAction<string>> | ((value: string) => void)) {
  return (event: React.ChangeEvent) => {
    const target = event.target as HTMLInputElement;
    setter(target.value);
  }
}

export function handleNumber (setter: React.Dispatch<React.SetStateAction<number>> | ((value: number) => void)) {
  return (event: React.ChangeEvent) => {
    const target = event.target as HTMLInputElement;
    const number = parseInt(target.value) || 0;
    setter(number);
  }
}

export function handleCheck (setter: React.Dispatch<React.SetStateAction<boolean>> | ((value: boolean) => void)) {
  return (event: React.ChangeEvent) => {
    const target = event.target as HTMLInputElement;
    setter(target.checked);
  }
}
