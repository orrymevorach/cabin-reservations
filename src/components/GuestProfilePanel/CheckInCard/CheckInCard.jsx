import Link from 'next/link';
import styles from './CheckInCard.module.scss';

export default function CheckInCard({ information }) {
  const { guest, isCheckInEnabled, checkInHref, checkInError } = information;

  return (
    <section className={styles.card} aria-labelledby='arrival-title'>
      <h2 id='arrival-title' className={styles.heading}>
        Check In
      </h2>
      {(guest.isCheckedIn || isCheckInEnabled) && (
        <p className={styles.status}>
          {guest.isCheckedIn ? 'Checked in' : 'Not checked in'}
        </p>
      )}
      {checkInError ? (
        <p className={styles.error} role='alert'>
          {checkInError}
        </p>
      ) : isCheckInEnabled && checkInHref ? (
        <>
          {!guest.isCheckedIn && (
            <p className={styles.description}>
              Check-in is open. Complete your check-in form before the festival.
            </p>
          )}
          <Link className={styles.link} href={checkInHref}>
            {guest.isCheckedIn
              ? 'View your check-in'
              : 'Complete your check-in form'}
          </Link>
        </>
      ) : (
        <p className={styles.description}>
          Check-in will open 24 hours before the festival.
        </p>
      )}
    </section>
  );
}
