import Cookies from 'js-cookie';
import Layout from '@/components/shared/layout/layout';
import DietaryIntakeCard from '@/components/GuestProfilePanel/DietaryIntakeCard/DietaryIntakeCard';
import useGuestProfile from '@/components/GuestProfilePanel/useGuestProfile';
import { COOKIES, ROUTES } from '@/utils/constants';
import styles from './DietaryIntakePage.module.scss';

export default function DietaryIntakePage() {
  const guestInformation = useGuestProfile({ shouldLoadDietaryOnly: true });
  const { information, isLoading, errorMessage, shouldSignIn } =
    guestInformation;
  const signInHref = `${ROUTES.HOME}?returnTo=${encodeURIComponent(ROUTES.DIETARY_INTAKE)}`;

  return (
    <Layout>
      <main className={styles.container}>
        <h1 className={styles.heading}>Highlands dietary information</h1>
        {isLoading && <p role='status'>Loading your dietary information...</p>}
        {errorMessage && !information && (
          <p className={styles.error} role='alert'>
            {errorMessage}
          </p>
        )}
        {shouldSignIn && (
          <p className={styles.description}>
            Please{' '}
            <a
              href={signInHref}
              onClick={() => {
                Cookies.remove(COOKIES.USER_RECORD, { path: '/' });
                Cookies.remove(COOKIES.UID, { path: '/' });
              }}
            >
              sign in with your ticket account
            </a>{' '}
            to submit your dietary information.
          </p>
        )}
        {information?.guest && (
          <DietaryIntakeCard
            guestInformation={guestInformation}
            shouldOpenFormInitially
          />
        )}
      </main>
    </Layout>
  );
}
