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

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';

import { apiUrl, languages } from '../variables';
import type { LanguageValue } from '../types';
import BootstrapIcon from './BootstrapIcon';
import '../styles/components/Editor.scss';

export interface Language {
  name: string;
  value: string;
  hello: string;
}

const languagesArr: Language[] = [];
for (const key in languages) {
  if (languages.hasOwnProperty(key)) {
    const value = languages[key as LanguageValue];
    languagesArr.push({
      name: value.name,
      value: key,
      hello: value.hello
    });
  }
}

export interface EditorProps {
  token: string;
  row?: boolean;
  sticky?: boolean;
  hideCopy?: boolean;
  defaultLanguage?: LanguageValue;
  defaultCode?: string;
  codeChange?: (code: string) => void;
  languageChange?: (language: LanguageValue) => void;
}

const Editor: React.FC<EditorProps> = (props: EditorProps) => {
  const {
    token,
    row = false,
    sticky = true,
    hideCopy = false,
    defaultLanguage = 'cpp',
    defaultCode = '',
    codeChange = () => {},
    languageChange = () => {}
  } = props;

  const [language, setLanguage] = useState<LanguageValue>(defaultLanguage || 'cpp');
  const [code, setCode] = useState<string>(defaultCode);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [terminal, setTerminal] = useState<string>('');
  const [errTerminal, setErrTerminal] = useState<string>('');
  const terminalRef = useRef<string>('');
  const errTerminalRef = useRef<string>('');
  const [running, setRunning] = useState<boolean>(false);

  const extensions = useMemo(() => {
    const exts = [];
    if (language === 'cpp') exts.push(cpp());
    if (language === 'java') exts.push(java());
    return exts;
  }, [language]);

  const updateCode = useCallback((value: string) => {
    setCode(value);
    codeChange(value);
  }, [codeChange]);

  const updateLanguage = useCallback((event: React.ChangeEvent) => {
    const target = event.target as HTMLSelectElement;
    const value = target.value as LanguageValue;
    setLanguage(value);
    languageChange(value);
  }, [languageChange]);

  const handleChange = useCallback((event: React.ChangeEvent) => {
    event.preventDefault();
  }, []);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    event.preventDefault();
    socket?.emit('input', event.key);
  }, [socket]);

  const runCode = useCallback((event: React.MouseEvent) => {
    event.preventDefault();

    const socket = io(`${apiUrl}/terminal`, {
      path: '/sockets',
      auth: { token }
    });

    socket.on('connect', () => {
      socket.emit('code', { code, language });
      terminalRef.current = '';
      errTerminalRef.current = '';
      setRunning(true);
    });

    socket.on('connect_error', (err) => {
      errTerminalRef.current = err.message;
      setErrTerminal(errTerminalRef.current);
    });

    socket.on('terminal_error', (message) => {
      errTerminalRef.current = message;
      setErrTerminal(errTerminalRef.current);
    });

    socket.on('disconnect', () => {
      setRunning(false);
      setSocket(null);
    });

    socket.on('output', (chunk: string) => {
      for (let i = 0; i < chunk.length; i++) {
        const char = chunk[i]
        if (char === '\b') {
          const string = terminalRef.current;
          terminalRef.current = string.substring(0, string.length - 1);
        } else {
          terminalRef.current += char;
        }
      }

      setTerminal(terminalRef.current);
    });

    setSocket(socket);
  }, [code, language, token]);

  const stopCode = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    socket?.disconnect();
    setTerminal('');
  }, [socket]);

  const copyCode = useCallback(async (event: React.MouseEvent) => {
    event.preventDefault();
    try {
      await navigator.clipboard.writeText(terminalRef.current);
    } catch (error) {}
  }, []);

  useEffect(() => {
    const helloCode = code !== '' ? code : languages[language].hello;
    setCode(helloCode);
    codeChange(helloCode);
    languageChange(language);
  }, [code, language, codeChange, languageChange]);

  return (
    <Row className={`align-items-stretch ${sticky ? 'editor-sticky' : ''}`.trim()}>
      <Col xs="12" sm={row ? '8' : '12'} className={row ? '' : 'mb-2'}>
        <CodeMirror editable={!running} readOnly={running} theme={vscodeDark} value={code} height={ row ? '500px' : '350px' } extensions={extensions} className="mb-2 editor-textarea" onChange={updateCode} />
        <div className="d-flex justify-content-between">
          <Form.Group controlId="editor-language">
            <Form.Select size="sm" value={language} onChange={updateLanguage}>
              { languagesArr.map((language, i) => (
                <option value={language.value} key={i}>{ language.name }</option>
              )) }
            </Form.Select>
          </Form.Group>

          <div className="d-flex align-items-center">
            { !hideCopy &&
              <Button variant="secondary" size="sm" type="button" className="d-flex align-items-center me-2" onClick={copyCode}>
                <BootstrapIcon icon="clipboard" className="me-1" />
                <span>Copy Output</span>
              </Button>
            }

            <Button variant="danger" size="sm" type="button" className="d-flex align-items-center me-2" disabled={!running} onClick={stopCode}>
              <BootstrapIcon icon="stop" className="me-1" />
              <span>Terminate</span>
            </Button>

            <Button variant="success" size="sm" type="button" className="d-flex align-items-center" disabled={running} onClick={runCode}>
              <BootstrapIcon icon="play" className="me-1" />
              <span>Run</span>
            </Button>
          </div>
        </div>
      </Col>

      <Col xs="12" sm={row ? '4' : '12'} className="d-flex flex-column">
        <textarea value={terminalRef.current} onChange={handleChange} onKeyDown={handleKeyDown} data-value={terminal} rows={5} className="col-12 rounded flex-fill p-2 mb-2 editor-terminal" />
        { errTerminal !== '' && errTerminalRef.current !== '' &&
          <textarea value={errTerminalRef.current} onChange={handleChange} data-value={errTerminal} rows={5} className="col-12 rounded p-2 mb-2 flex-fill editor-terminal editor-terminal-error" readOnly />
        }
      </Col>
    </Row>
  )
};

export default Editor;
