import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Takeover from '../takeover/takeover';
import { COOKIES, FEATURE_FLAGS, ROUTES } from '@/utils/constants';
import Cookies from 'js-cookie';
import { signOutOfFirebase } from '@/components/loginPage/login/firebase-utils';
import styles from './noUserTakeover.module.scss';

export default function NoUserTakeover() {
  const { ENABLE_RESERVATIONS } = FEATURE_FLAGS;
  const router = useRouter();
  const [isLoggingInAgain, setIsLoggingInAgain] = useState(false);

  const handleLoginAgain = async event => {
    event.preventDefault();
    if (isLoggingInAgain) return;
    setIsLoggingInAgain(true);

    try {
      const signOutResponse = await signOutOfFirebase();
      if (signOutResponse?.error) {
        console.error('Unable to sign out of Firebase:', signOutResponse.error);
      }
    } catch (error) {
      console.error('Unable to sign out of Firebase:', error);
    } finally {
      const cookieNames = Object.keys(Cookies.get());
      cookieNames.forEach(cookieName => {
        Cookies.remove(cookieName, { path: '/' });
      });
      Cookies.remove(COOKIES.USER_RECORD, { path: '/' });
      Cookies.remove(COOKIES.UID, { path: '/' });
      await router.replace(ROUTES.HOME);
    }
  };

  return (
    <Takeover modalClassNames={styles.modal} hideCloseButton>
      <div className={styles.container}>
        {ENABLE_RESERVATIONS ? (
          <>
            <p className={styles.title}>
              Oh No! There was an unexpected error.
            </p>
            <p className={styles.instruction}>Please try the following:</p>
            <ol className={styles.list}>
              <li>
                If you have not yet purchased a ticket, please{' '}
                <a
                  href='https://highlandsmusicfestival.ca/buy-tickets'
                  target='_blank'
                  className={styles.link}
                >
                  buy a ticket
                </a>{' '}
                and try logging in again.
              </li>
              <li>
                If you have already purchased a ticket, please try{' '}
                <a
                  href={ROUTES.HOME}
                  className={styles.link}
                  onClick={handleLoginAgain}
                  aria-disabled={isLoggingInAgain}
                >
                  {isLoggingInAgain ? 'logging out' : 'logging in'}
                </a>{' '}
                again. <br />
                <span className={styles.note}>
                  (Make sure you are logging in with the email you used to
                  purchase the ticket.)
                </span>
              </li>
            </ol>
            <p className={styles.contact}>
              If you require any assistance, please contact us at
              info@highlandsmusicfestival.ca.
            </p>
          </>
        ) : (
          <>
            <p className={styles.title}>Cabin Reservations Coming Soon</p>
            <p className={styles.instruction}>
              If you have purchased a cabin and wish to manage your reservation,
              please try{' '}
              <Link href={ROUTES.HOME} className={styles.link}>
                logging in
              </Link>{' '}
              again.
            </p>
            <p className={styles.contact}>
              If you did not purchase a cabin, cabin and bed reservations will
              be opening soon. Keep an eye on your email for updates!
            </p>
            <p className={styles.contact}>
              If you require any assistance, please contact us at
              info@highlandsmusicfestival.ca.
            </p>
          </>
        )}
      </div>
    </Takeover>
  );
}
