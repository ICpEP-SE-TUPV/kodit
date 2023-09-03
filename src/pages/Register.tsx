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
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import axios from 'axios';

import { guest } from './navigation/default';
import { apiUrl } from '../variables';
import { notify } from '../reducers/notifications';
import { handleCheck, handleInput } from '../utils/handlers';
import Page from '../components/Page';
import CardForm from '../components/CardForm';
import BootstrapIcon from '../components/BootstrapIcon';

const Register: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [name, setName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [vPassword, setVPassword] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isFaculty, setIsFaculty] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    const target = event.target as HTMLFormElement;
    const action = target.action;

    if (password !== vPassword) {
      setError('Password does not match');
      setSubmitting(false);
      return;
    }

    axios.post(action, { name, username, password, isFaculty }).then(res => {
      const { success, message } = res.data;
      if (!success) return setError(message);

      navigate('/');
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
  }, [name, username, password, vPassword, isFaculty, dispatch, navigate]);

  return (
    <Page activeKey="/" navs={guest} footer={false} className="py-5">
      <Container>
        <CardForm action={`${apiUrl}/user`} method="post" onSubmit={handleSubmit}>
          <CardForm.Title>Register User</CardForm.Title>

          <Form.Group controlId="register-name" className="mb-3">
            <Form.Label>Name:</Form.Label>
            <Form.Control type="text" name="name" value={name} placeholder="Full name" autoComplete="name" onChange={handleInput(setName)} required />
          </Form.Group>

          <Form.Group controlId="register-username" className="mb-3">
            <Form.Label>Username:</Form.Label>
            <Form.Control type="text" name="username" value={username} placeholder="Username" autoComplete="username" onChange={handleInput(setUsername)} required />
          </Form.Group>

          <Form.Group controlId="register-password" className="mb-3">
            <Form.Label>Password:</Form.Label>
            <Form.Control type="password" name="password" value={password} placeholder="Password" autoComplete="new-password" onChange={handleInput(setPassword)} required />
          </Form.Group>

          <Form.Group controlId="register-v-password" className="mb-3">
            <Form.Label>Verify Password:</Form.Label>
            <Form.Control type="password" name="v-password" value={vPassword} placeholder="Re-enter password" autoComplete="off" onChange={handleInput(setVPassword)} required />
          </Form.Group>

          <Form.Check type="checkbox" id="register-faculty" label="Are you a teacher?" className="mb-3" checked={isFaculty} onChange={handleCheck(setIsFaculty)} />

          { error !== '' && <Alert variant="danger" className="mb-3">{ error }</Alert> }

          <div className="d-grid">
            <Button variant="success" type="submit" className="btn-icon mb-1" disabled={submitting}>
              <BootstrapIcon icon="person-plus" width={20} height={20} className="me-2" />
              <span>{ submitting ? 'Registering...' : 'Register' }</span>
            </Button>

            <Link to="/" className="text-secondary text-center">Already have an account?</Link>
          </div>
        </CardForm>
      </Container>
    </Page>
  );
};

export default Register;
