import styles from './layout.module.scss';
import Image from 'next/image';
import logo from 'public/Logo-1200px-No-Bkgd-min.png';
import clsx from 'clsx';
import Cookies from 'js-cookie';
import { COOKIES, ROUTES } from '@/utils/constants';
import { useRouter } from 'next/router';
import { useUser } from '@/context/user-context';
import Nav from '../nav/nav';
import { useState } from 'react';
import { signOutOfFirebase } from '@/components/loginPage/login/firebase-utils';
import { logSentryError } from '@/utils/sentry-utils';

export const Logo = ({ classNames = ' ' }) => {
  return <Image src={logo} className={clsx(styles.image, classNames)} alt='' />;
};

export default function Layout({ children }) {
  const router = useRouter();
  const isSummaryPage = router.pathname === ROUTES.SUMMARY;
  const userData = useUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  if (!userData)
    return (
      <div className={clsx(styles.container, styles.noUser)}>
        <Image
          src={logo}
          className={styles.image}
          alt=''
          quality={50}
        />
        {children}
      </div>
    );

  const { user, dispatch } = userData;
  const hasCabin = Boolean(user?.cabin);
  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setLogoutError('');
    try {
      const response = await signOutOfFirebase();
      if (response?.error) throw response.error;
      Cookies.remove(COOKIES.USER_RECORD, { path: '/' });
      Cookies.remove(COOKIES.UID, { path: '/' });
      dispatch({ type: 'LOG_OUT' });
      window.location = '/';
    } catch (error) {
      logSentryError(error, { action: 'log-out-reservation-account' });
      setLogoutError('Unable to log out. Please try again.');
      setIsLoggingOut(false);
    }
  };
  return (
    <div className={styles.container}>
      {user && (
        <Nav
          navData={[
            {
              label: 'My Profile',
              isButton: true,
              isShowing: !isSummaryPage && hasCabin,
              url: ROUTES.SUMMARY,
              isAnchor: true,
              isBlue: true,
            },
            {
              label: isLoggingOut ? 'Logging Out...' : 'Log Out',
              isButton: true,
              handleClick: handleLogout,
            },
          ]}
        />
      )}

      <Image
        src={logo}
        className={clsx(styles.image, isSummaryPage && styles.compactLogo)}
        alt=''
        quality={50}
      />
      {logoutError && (
        <p className={styles.error} role='alert'>
          {logoutError}
        </p>
      )}
      {children}
    </div>
  );
}
