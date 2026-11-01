import Link from 'next/link';
import { useUser } from '@/context/user-context';
import { FEATURE_FLAGS, ROUTES } from '@/utils/constants';
import GuestProfilePanel from '@/components/GuestProfilePanel/GuestProfilePanel';
import useGuestProfile from '@/components/GuestProfilePanel/useGuestProfile';
import Loader from '@/components/shared/loader/loader';
import styles from './ProfileDashboard.module.scss';

export default function ProfileDashboard({ children }) {
  const { user } = useUser();
  const guestInformation = useGuestProfile();
  const canSelectCabin =
    FEATURE_FLAGS.ENABLE_RESERVATIONS && !FEATURE_FLAGS.ENABLE_COUNTDOWN;

  if (!user) return <Loader isDotted />;

  return (
    <main className={styles.container}>
      <h1 className={styles.heading}>My Highlands profile</h1>
      <p className={styles.greeting}>Hi, {user.name || 'Highlands guest'}!</p>
      <div className={styles.columns}>
        <section
          className={styles.reservation}
          aria-labelledby='profile-reservation-title'
        >
          <h2 id='profile-reservation-title' className={styles.sectionHeading}>
            Cabin & guests
          </h2>
          {children || (
            <>
              <p className={styles.description}>
                You haven't selected a cabin yet.
              </p>
              {canSelectCabin ? (
                <Link href={ROUTES.CABIN_SELECTION} className={styles.link}>
                  Select a cabin
                </Link>
              ) : (
                <p className={styles.description}>
                  Cabin selection is currently closed.
                </p>
              )}
            </>
          )}
        </section>
        <div className={styles.guestInformation}>
          <GuestProfilePanel guestInformation={guestInformation} />
        </div>
      </div>
    </main>
  );
}
