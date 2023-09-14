import styles from './sidebar.module.scss';
import { useReservation } from '@/context/reservation-context';
import { CABIN_SELECTION_STAGES } from '@/hooks/useReservation';
import ReserveButton from '@/components/shared/reserveButton';
import rainbow from 'public/rainbow-min.png';
import Image from 'next/image';
import ReservationSummary from '@/components/shared/reservationSummary';
import VerifiedUsers from '@/components/shared/verifiedUsers/verifiedUsers';
import { useUser } from '@/context/user-context';
import Loader from '@/components/shared/loader/loader';
import Link from 'next/link';

export default function Sidebar({ cabinData }) {
  const {
    currentStage,
    groupData: { members },
  } = useReservation();
  const { user } = useUser();
  const { isLoading: isCabinDataLoading, cabin } = cabinData;

  if (isCabinDataLoading || !user) {
    return (
      <div className={styles.sidebar}>
        <Loader isDotted />
      </div>
    );
  }

  const isConfirmationStage =
    currentStage !== CABIN_SELECTION_STAGES.CONFIRMATION;
  const cabinHasEnoughBeds = cabin.openBeds >= members.length;
  const cabinIsOpen = cabin.availability === 'Open';
  const showReservationButton =
    isConfirmationStage && cabinHasEnoughBeds && cabinIsOpen;

  return (
    <div className={styles.sidebar}>
      <div className={styles.titleContainer}>
        <p className={styles.title}>Summary</p>
        <Image src={rainbow} alt="" className={styles.image} />
      </div>
      <ReservationSummary cabinData={cabinData} />
      <VerifiedUsers
        hideRemoveButton={currentStage !== CABIN_SELECTION_STAGES.ADD_GUESTS}
      />
      {!cabinHasEnoughBeds && (
        <p className={styles.notEnoughBedsText}>
          There are not enough beds in this cabin for your entire group. Please
          select a different cabin on the{' '}
          <Link href="/cabin-selection" className={styles.link}>
            cabin selection page.
          </Link>
        </p>
      )}
      {!cabinIsOpen && (
        <p className={styles.notEnoughBedsText}>
          This cabin is not available for booking. Please select a different
          cabin on the{' '}
          <Link href="/cabin-selection" className={styles.link}>
            cabin selection page.
          </Link>
        </p>
      )}
      {showReservationButton && <ReserveButton cabin={cabinData?.cabin} />}
    </div>
  );
}
