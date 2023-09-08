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
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';

import type { RootState } from '../store';
import { updateTheme } from '../reducers/theme';
import BootstrapIcon from './BootstrapIcon';
import logo from '../assets/logo.png';

export interface HeaderNav {
  name: string;
  link: string;
  icon?: string;
}

export interface HeaderProps {
  activeKey?: string;
  navs?: HeaderNav[];
}

const Header: React.FC<HeaderProps> = (props: HeaderProps) => {
  const { activeKey, navs = [] } = props;
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme.theme);

  const toggleTheme = (event: React.MouseEvent) => {
    event.preventDefault();
    const toggle = theme === 'dark' ? 'light' : 'dark';
    dispatch(updateTheme(toggle));
  };

  return (
    <header className="d-flex align-items-center py-3 bg-dark text-white">
      <Container>
        <div className="d-flex flex-column flex-sm-row flex-wrap align-items-center justify-content-start justify-content-sm-between">
          <Link to="/" className="d-flex align-items-center flex-fill mb-2 mb-sm-0 text-white text-decoration-none">
            <img src={logo} alt="KodIt Logo" width="32" height="32" />
          </Link>

          <Nav activeKey={activeKey} as="ul">
            { navs.map((nav, i) => (
              <Nav.Item as="li" key={i}>
                <LinkContainer to={nav.link}>
                  <Nav.Link className="d-flex align-items-center px-2">
                    { nav.icon && <BootstrapIcon icon={nav.icon} className="me-1" /> }
                    <span>{ nav.name }</span>
                  </Nav.Link>
                </LinkContainer>
              </Nav.Item>
              )
            ) }

            <Nav.Item as="li" className="d-flex align-items-center">
              <Button variant="link" type="button" className="nav-link d-flex align-items-center" onClick={toggleTheme}>
                <BootstrapIcon icon={theme === 'dark' ? 'sun' : 'moon'} width={20} height={20} />
              </Button>
            </Nav.Item>
          </Nav>
        </div>
      </Container>
    </header>
  );
};

export default Header;
