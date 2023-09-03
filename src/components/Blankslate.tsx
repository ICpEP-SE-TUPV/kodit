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

import BootstrapIcon from './BootstrapIcon';
import '../styles/components/Blankslate.scss';

interface BlankslateProps {
  title: string;
  subtitle?: string;
  icon?: string;
}

const Blankslate: React.FC<BlankslateProps> = (props: BlankslateProps) => {
  const { title, subtitle = '', icon = '' } = props;
  return (
    <Card className="blankslate col-12">
      <Card.Body>
        { icon && <BootstrapIcon icon={icon} width={128} height={128} className="mx-auto mb-4" /> }
        <Card.Title>{ title }</Card.Title>
        { subtitle && <Card.Subtitle>{ subtitle }</Card.Subtitle> }
      </Card.Body>
    </Card>
  );
};

export default Blankslate;