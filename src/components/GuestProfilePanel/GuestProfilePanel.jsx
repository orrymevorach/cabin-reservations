import Cookies from 'js-cookie';
import { COOKIES, ROUTES } from '@/utils/constants';
import DietaryIntakeCard from './DietaryIntakeCard/DietaryIntakeCard';
import CheckInCard from './CheckInCard/CheckInCard';
import styles from './GuestProfilePanel.module.scss';

export default function GuestProfilePanel({ guestInformation }) {
  const { information, isLoading, errorMessage, shouldSignIn } =
    guestInformation;
  const guest = information?.guest;

  return (
    <>
      {isLoading && <p role='status'>Loading your guest information...</p>}
      {errorMessage && !guest && (
        <p className={styles.error} role='alert'>
          {errorMessage}
        </p>
      )}
      {shouldSignIn && (
        <p className={styles.description}>
          Please{' '}
          <a
            href={ROUTES.HOME}
            onClick={() => {
              Cookies.remove(COOKIES.USER_RECORD, { path: '/' });
              Cookies.remove(COOKIES.UID, { path: '/' });
            }}
          >
            sign in
          </a>{' '}
          with your ticket account to view and update your information.
        </p>
      )}
      {guest && (
        <>
          <DietaryIntakeCard guestInformation={guestInformation} />
          <CheckInCard information={information} />
        </>
      )}
    </>
  );
}
