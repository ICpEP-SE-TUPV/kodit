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

export const apiUrl = process.env.REACT_APP_API || '';

export const languages = {
  c: {
    name: 'C',
    hello: '#include <stdio.h>\n\nint main () {\n  printf("Hello, World");\n  return 0;\n}\n'
  },
  cpp: {
    name: 'C++',
    hello: '#include <iostream>\n\nusing namespace std;\n\nint main () {\n  cout << "Hello, World" << endl;\n  return 0;\n}\n'
  },
  java: {
    name: 'Java',
    hello: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, World!");\n  }\n}\n'
  }
} as const;
