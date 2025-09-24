import Layout from '../shared/layout/layout';
import CheckInForm from './form/form';
import styles from './checkIn.module.scss';
import { useCheckIn } from '@/context/check-in-context';
import { useEffect } from 'react';

export default function CheckIn({ user }) {
  const {
    state: { stage },
    stages,
    dispatch,
    actions,
  } = useCheckIn();

  useEffect(() => {
    if (user && user.isCheckedIn === 'Yes') {
      dispatch({ type: actions.SET_STAGE, stage: stages.CONFIRMATION });
    }
  }, [user, dispatch, actions, stages]);

  if (!user) {
    return (
      <main>
        <Layout>
          <div className={styles.textContainer}>
            <p className={styles.text}>
              Please click the link in your email to access the check-in form.
            </p>
            <p className={styles.text}>
              If you did not receive the email, or are experiencing issues,
              please contact{' '}
              <a
                href="mailto:info@highlandsmusicfestival.ca"
                className={styles.link}
              >
                info@highlandsmusicfestival.ca
              </a>
              .
            </p>
          </div>
        </Layout>
      </main>
    );
  }

  return (
    <main>
      <Layout>
        <h2 className={styles.title}>Hi, {user?.name}!</h2>
        {stage === stages.FILL_OUT_FORM && (
          <>
            <div className={styles.textContainer}>
              <p className={styles.text}>
                Please fill out the form below to help us prepare for your
                arrival.
              </p>
            </div>
            <CheckInForm />
          </>
        )}
        {stage === stages.SIGN_WAIVER && (
          <div>
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLScgMu0FynbVLhvjh6EmTsTh0X9je7Gl6t5HUAz9VWezoN4vYw/viewform"
              frameborder="0"
              className={styles.iframe}
            ></iframe>
          </div>
        )}
        {stage === stages.CONFIRMATION && (
          <div className={styles.confirmationContainer}>
            <p className={styles.confirmationText}>
              You are checked in, see you at Highlands!
            </p>
          </div>
        )}
      </Layout>
    </main>
  );
}
