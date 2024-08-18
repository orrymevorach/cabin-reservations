import styles from './layout.module.scss';
import Image from 'next/image';
import logo from 'public/Logo-1200px-No-Bkgd-min.png';
import clsx from 'clsx';
import Cookies from 'js-cookie';
import { COOKIES, ROUTES } from '@/utils/constants';
import { useRouter } from 'next/router';
import { useUser } from '@/context/user-context';
import Nav from '../nav/nav';

export const Logo = ({ classNames = ' ' }) => {
  return <Image src={logo} className={clsx(styles.image, classNames)} alt="" />;
};

export default function Layout({ children }) {
  const router = useRouter();
  const { user, dispatch } = useUser();

  const handleLogout = () => {
    Cookies.remove(COOKIES.USER_RECORD);
    dispatch({ type: 'LOG_OUT' });
    window.location = '/';
  };

  const isSummaryPage = router.pathname === ROUTES.SUMMARY;
  const hasCabin = !!user?.cabin && user.cabin.length > 0;

  return (
    <div className={styles.container}>
      {user && (
        <Nav
          navData={[
            {
              label: 'My Reservation',
              isButton: true,
              isShowing: !isSummaryPage && hasCabin,
              url: ROUTES.SUMMARY,
              isAnchor: true,
            },
            {
              label: 'Log Out',
              isButton: true,
              handleClick: handleLogout,
            },
          ]}
        />
      )}

      <Image src={logo} className={styles.image} alt="" quality={50} />
      {children}
    </div>
  );
}
