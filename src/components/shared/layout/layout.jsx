import styles from './layout.module.scss';
import Image from 'next/image';
import logo from 'public/Logo-1200px-No-Bkgd-min.png';
import clsx from 'clsx';
import Button from '../button/button';
import { useState } from 'react';
import Cookies from 'js-cookie';
import { COOKIES, ROUTES } from '@/utils/constants';
import { useRouter } from 'next/router';
import { useUser } from '@/context/user-context';
import { useWindowSize } from '@/context/window-size-context';

export const Logo = ({ classNames = ' ' }) => {
  return <Image src={logo} className={clsx(styles.image, classNames)} alt="" />;
};

export default function Layout({ children }) {
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const router = useRouter();
  const { user, dispatch } = useUser();
  const { isMobile } = useWindowSize();

  const handleLogout = () => {
    setIsLogoutLoading(true);
    Cookies.remove(COOKIES.USER_RECORD);
    setTimeout(() => {
      dispatch({ type: 'LOG_OUT' });
      window.location = '/';
    }, 300);
  };

  const handleViewReservation = () => {
    setIsPageLoading(true);
    setTimeout(() => {
      router.push(ROUTES.SUMMARY);
    }, 300);
  };

  const isSummaryPage = router.pathname === ROUTES.SUMMARY;
  const hasCabin = user?.cabin && user.cabin.length > 0;

  return (
    <div className={styles.container}>
      {user && (
        <div className={styles.buttons}>
          {!isSummaryPage && hasCabin ? (
            <Button
              isLoading={isPageLoading}
              handleClick={handleViewReservation}
              isSmall={!!isMobile}
              classNames={styles.button}
            >
              My Reservation
            </Button>
          ) : (
            ''
          )}
          <Button
            isLoading={isLogoutLoading}
            handleClick={handleLogout}
            classNames={clsx(styles.logoutButton, styles.button)}
            isSmall={!!isMobile}
          >
            Log Out
          </Button>
        </div>
      )}

      <Image src={logo} className={styles.image} alt="" />
      {children}
    </div>
  );
}
