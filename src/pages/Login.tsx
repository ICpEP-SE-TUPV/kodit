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

import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import axios from 'axios';

import { guest } from './navigation/default';
import { apiUrl } from '../variables';
import { setUser } from '../reducers/user';
import { notify } from '../reducers/notifications';
import { handleInput } from '../utils/handlers';
import Page from '../components/Page';
import CardForm from '../components/CardForm';
import BootstrapIcon from '../components/BootstrapIcon';
import { RootState } from '../store';

const Login: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    const target = event.target as HTMLFormElement;
    const action = target.action;

    axios.post(action, { username, password }).then(res => {
      const { success, message, token } = res.data;
      if (!success) return setError(message);

      const params = new URLSearchParams(location.search);
      const next = params.get('next') || '/home';
      dispatch(setUser(token));
      navigate(next);
    }).catch(error => {
      dispatch(notify({
        title: 'Error',
        message: error.message,
        icon: 'bug',
        closeAfter: 5000
      }));
    }).finally(() => {
      setSubmitting(false);
    });
  }, [username, password, dispatch, navigate, location]);

  if (token !== '') return <Navigate to="/home" />;

  return (
    <Page activeKey="/" navs={guest} footer={false} className="py-5">
      <Container>
        <CardForm action={`${apiUrl}/user/login`} method="post" onSubmit={handleSubmit}>
          <CardForm.Title>Sign In</CardForm.Title>

          <Form.Group controlId="login-username" className="mb-3">
            <Form.Label>Username:</Form.Label>
            <Form.Control type="text" name="username" value={username} placeholder="Username" autoComplete="username" onChange={handleInput(setUsername)} required />
          </Form.Group>

          <Form.Group controlId="login-password" className="mb-3">
            <Form.Label>Password:</Form.Label>
            <Form.Control type="password" name="password" value={password} placeholder="Password" autoComplete="current-password" onChange={handleInput(setPassword)} required />
          </Form.Group>

          { error !== '' && <Alert variant="danger" className="mb-3">{ error }</Alert> }

          <div className="d-grid">
            <Button variant="success" type="submit" className="btn-icon mb-1" disabled={submitting}>
              <BootstrapIcon icon="box-arrow-in-right" width={20} height={20} className="me-2" />
              <span>{ submitting ? 'Signing In...' : 'Sign In' }</span>
            </Button>

            <Link to="/register" className="text-secondary text-center">Haven't registered yet?</Link>
          </div>
        </CardForm>
      </Container>
    </Page>
  );
};

export default Login;
