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
import bootstrapIcons from 'bootstrap-icons/bootstrap-icons.svg';

export interface BootstrapIconProps extends React.SVGProps<SVGSVGElement> {
  icon: string;
}

const BootstrapIcon: React.FC<BootstrapIconProps> = (props: BootstrapIconProps) => {
  const { icon } = props;
  const modified = Object.assign({}, props);
  modified.className = typeof props.className !== 'undefined' ? 'bi ' + props.className : '';
  modified.fill = props.fill || 'currentColor'
  modified.width = props.width || 16;
  modified.height = props.height || 16;

  return (
    <svg {...modified}>
      <use href={`${bootstrapIcons}#${icon}`} />
    </svg>
  )
};

export default BootstrapIcon;
