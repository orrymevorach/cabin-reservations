import Layout from '../shared/layout/layout';
import CheckInForm from './form/form';
import Waiver from './waiver/waiver';
import styles from './checkIn.module.scss';
import { useCheckIn } from '@/context/check-in-context';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';

export default function CheckIn({ user }) {
  const [checkInRecordId, setCheckInRecordId] = useState('');
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
                href='mailto:info@highlandsmusicfestival.ca'
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
            <CheckInForm user={user} onCheckInCreated={setCheckInRecordId} />
          </>
        )}
        {stage === stages.SIGN_WAIVER && (
          <Waiver checkInRecordId={checkInRecordId} user={user} />
        )}
        {stage === stages.CONFIRMATION && (
          <div className={styles.confirmationContainer}>
            <div className={styles.confirmationIcon} aria-hidden='true'>
              <FontAwesomeIcon icon={faCircleCheck} />
            </div>
            <p className={styles.confirmationEyebrow}>Check-in complete</p>
            <h2 className={styles.confirmationTitle}>
              You&rsquo;re all set for Highlands
            </h2>
            <p className={styles.confirmationText}>
              Your arrival details and waiver have been saved. We&rsquo;ve
              emailed your QR code to <strong>{user.email}</strong> for entry.
            </p>
            <div className={styles.confirmationDetails}>
              <div>
                <span>Where</span>
                <a
                  href='https://www.google.com/maps/place/Highlands+Music+Festival/data=!4m2!3m1!1s0x0:0xc073b83c8da9dc35?sa=X&ved=1t:2428&ictx=111'
                  target='_blank'
                  rel='noreferrer'
                  className={styles.confirmationLocationLink}
                >
                  Camp Walden
                </a>
                <small className={styles.confirmationAddress}>
                  38483 ON-28, Brudenell, Lyndoch and Raglan, ON K0J 2E0
                </small>
              </div>
              <div>
                <span>When</span>
                <strong>September 24-27, 2026</strong>
              </div>
            </div>
            <p className={styles.confirmationHelp}>
              Questions or no QR code? Contact{' '}
              <a href='mailto:info@highlandsmusicfestival.ca'>
                info@highlandsmusicfestival.ca
              </a>
            </p>
          </div>
        )}
      </Layout>
    </main>
  );
}
