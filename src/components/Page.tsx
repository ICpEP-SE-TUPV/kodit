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

import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';

import type { RootState } from '../store';
import { closeNotification } from '../reducers/notifications';
import Header from './Header';
import type { HeaderProps } from './Header';
import Footer from './Footer';
import BootstrapIcon from './BootstrapIcon';
import '../styles/components/Page.scss';

interface PageProps extends HeaderProps {
  className?: string;
  children?: React.ReactNode;
  footer?: boolean;
}

const Page: React.FC<PageProps> = (props: PageProps) => {
  const { activeKey, navs, className, children, footer = true } = props;
  const dispatch = useDispatch();
  const themeState = useSelector((state: RootState) => state.theme);
  const notificationsState = useSelector((state: RootState) => state.notifications);
  const { theme } = themeState;
  const { notifications } = notificationsState;

  const closeToast = useCallback((index: number) => () => {
    dispatch(closeNotification(index));
  }, [dispatch]);

  return (
    <React.Fragment>
      <Header activeKey={activeKey} navs={navs} />

      <main className={className} data-bs-theme={theme}>{ children }</main>

      <ToastContainer position="bottom-end" className="position-fixed me-4 mb-4" data-bs-theme={theme}>
        { notifications.map((notification, i) => {
          return (
            <Toast autohide={typeof notification.closeAfter === 'number'} delay={notification.closeAfter} show={notification.show} onClose={closeToast(i)} key={i}>
              <Toast.Header>
                { notification.icon && <BootstrapIcon icon={notification.icon} width={18} height={18} className="me-2" /> }
                <strong className="me-auto">{ notification.title }</strong>
              </Toast.Header>

              <Toast.Body className="text-white">
                { notification.message }
              </Toast.Body>
            </Toast>
          );
        }) }
      </ToastContainer>

      { footer && <Footer /> }
    </React.Fragment>
  );
};

export default Page;
