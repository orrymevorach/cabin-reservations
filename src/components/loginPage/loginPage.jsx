import styles from './loginPage.module.scss';
import Login from '@/components/loginPage/login/login';
import Information from '@/components/loginPage/information/information';
import { useRouter } from 'next/router';
import { ROUTES } from '@/utils/constants';
import ForgotPassword from './forgot-password/forgot-password';
import CreateAccountButton from './create-account-button/create-account-button';

export default function LoginPageContainer() {
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
        <CreateAccountButton />
      </div>
    </main>
  );
}
