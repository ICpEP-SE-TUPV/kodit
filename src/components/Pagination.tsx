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

import React, { useMemo } from 'react';
import { default as BootstrapPagination } from 'react-bootstrap/Pagination';

export interface PaginationProps {
  count: number;
  active: number;
  limit: number;
  className?: string;
  setActive?: (index: number) => void;
}

const Pagination: React.FC<PaginationProps> = (props: PaginationProps) => {
  const { count, active, limit, className = '', setActive = () => {} } = props;

  const pagination: React.ReactNode[] = useMemo(() => {
    const node: React.ReactNode[] = [];
    const totalPages = Math.ceil(count / limit);
    const navPage = (index: number) => () => {
      if (index === active) return;
      setActive(index);
    };

    node.push(<BootstrapPagination.Prev onClick={navPage(active - 1)} disabled={active === 0} key="prev" />);

    if (totalPages > 7) {
      node.push(<BootstrapPagination.Item active={active === 0} onClick={navPage(0)} key={0}>1</BootstrapPagination.Item>);
      if (active - 2 > 1) node.push(<BootstrapPagination.Ellipsis key="ellipsis-0" />);

      for (let i = active - 2; i <= active + 2; i++) {
        if (i <= 0 || i >= totalPages - 1) continue;
        node.push(<BootstrapPagination.Item active={active === i} onClick={navPage(i)} key={i}>{ i + 1 }</BootstrapPagination.Item>);
      }

      if (active + 2 < totalPages - 2) node.push(<BootstrapPagination.Ellipsis key="ellipsis-1" />);
      node.push(<BootstrapPagination.Item active={active + 1 === totalPages} onClick={navPage(totalPages - 1)} key={totalPages - 1}>{ totalPages }</BootstrapPagination.Item>);
    } else {
      for (let i = 0; i < totalPages; i++) {
        node.push(<BootstrapPagination.Item active={active === i} onClick={navPage(i)} key={i}>{ i + 1 }</BootstrapPagination.Item>);
      }
    }

    node.push(<BootstrapPagination.Next onClick={navPage(active + 1)} disabled={active + 1 === totalPages} key="next" />);
    return node;
  }, [count, active, limit, setActive]);

  return (
    <BootstrapPagination className={className}>{ pagination }</BootstrapPagination>
  );
};

export default Pagination;
