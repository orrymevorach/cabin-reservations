import styles from './loginPage.module.scss';
import Login from '@/components/loginPage/login/login';
import Information from '@/components/loginPage/information/information';
import { useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import { COOKIES, ROUTES } from '@/utils/constants';
import ForgotPassword from './forgot-password/forgot-password';

const useLoginExistingUserOnPageLoad = () => {
  const router = useRouter();
  useEffect(() => {
    const userRecordCookie = Cookies.get(COOKIES.USER_RECORD);
    if (userRecordCookie) {
      router.push({
        pathname: ROUTES.CABIN_SELECTION,
      });
    }
  }, [router]);
};

export default function LoginPageContainer() {
  useLoginExistingUserOnPageLoad();
  const router = useRouter();
  const handleSuccess = ({ user }) => {
    const hasCabin = user?.cabin;
    if (hasCabin) router.push(ROUTES.SUMMARY);
    else router.push(ROUTES.CABIN_SELECTION);
  };
  return (
    <main className={styles.mainContainer}>
      <div className={styles.column}>
        <Information />
      </div>
      <div className={styles.column}>
        <Login handleSuccess={handleSuccess} />
        <ForgotPassword />
      </div>
    </main>
  );
}
