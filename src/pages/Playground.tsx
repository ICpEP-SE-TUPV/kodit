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
import Container from 'react-bootstrap/Container';

import { homepage } from './navigation/default';
import { useToken } from '../hooks/token';
import Page from '../components/Page';
import Editor from '../components/Editor';

const Playground: React.FC = () => {
  const { token } = useToken();

  return (
    <Page activeKey="/playground" navs={homepage} className="py-4">
      <Container>
        <Editor token={token} row />
      </Container>
    </Page>
  );
};

export default Playground;
