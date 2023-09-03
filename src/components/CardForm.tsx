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

import React from 'react';
import Card from 'react-bootstrap/Card';

import '../styles/components/CardForm.scss';

type SubComponents = {
  Title: typeof Card.Title;
}

export interface CardFormProps extends React.HTMLProps<HTMLFormElement> {
  title?: string;
}

const CardForm: React.FC<CardFormProps> & SubComponents = (props: CardFormProps) => {
  return (
    <Card className="form-card">
      { props.title && <Card.Header>{ props.title }</Card.Header> }

      <Card.Body>
        <form {...props} />
      </Card.Body>
    </Card>
  );
};

CardForm.Title = Card.Title;

export default CardForm;
