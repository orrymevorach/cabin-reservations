import styles from './sidebar.module.scss';
import { useReservation } from '@/context/reservation-context';
import { CABIN_SELECTION_STAGES } from '@/hooks/useReservation';
import ReserveButton from '@/components/shared/reserveButton/reserveButton';
import rainbow from 'public/rainbow-min.png';
import Image from 'next/image';
import ReservationSummary from '@/components/shared/reservationSummary/reservationSummary';
import VerifiedUsers from '@/components/shared/verifiedUsers/verifiedUsers';
import { useUser } from '@/context/user-context';
import Loader from '@/components/shared/loader/loader';
import Link from 'next/link';

export default function Sidebar() {
  const {
    currentStage,
    groupData: { members },
    cabinData,
  } = useReservation();
  const isHeadStaffCabin = cabinData?.cabin?.bedConfiguration === 'Head Staff';
  const numberOfMembersInGroup = members?.length;
  const isEligibleToBookHeadStaffCabin =
    !isHeadStaffCabin || (isHeadStaffCabin && numberOfMembersInGroup === 3);

  const { user } = useUser();
  const { cabin } = cabinData;

  if (!user || !cabin) {
    return (
      <div className={styles.sidebar}>
        <Loader isDotted />
      </div>
    );
  }

  const isConfirmationStage =
    currentStage === CABIN_SELECTION_STAGES.CONFIRMATION;
  const cabinHasEnoughBeds = cabin.openBeds >= members?.length;
  const cabinIsOpen = cabin.availability === 'Open';
  const showReservationButton =
    !isConfirmationStage &&
    cabinHasEnoughBeds &&
    cabinIsOpen &&
    isEligibleToBookHeadStaffCabin;

  return (
    <div className={styles.sidebar} id="sidebar">
      <div className={styles.titleContainer}>
        <p className={styles.title}>Summary</p>
        <Image src={rainbow} alt="" className={styles.image} />
      </div>
      <ReservationSummary cabinData={cabinData} />
      <VerifiedUsers hideRemoveButton={true} />
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
      {isHeadStaffCabin && numberOfMembersInGroup < 3 ? (
        <p className={styles.headStaffText}>
          Please add {3 - numberOfMembersInGroup} more guest
          {numberOfMembersInGroup !== 2 && 's'} to your group to book this cabin
        </p>
      ) : (
        ''
      )}
      {showReservationButton && <ReserveButton cabin={cabinData?.cabin} />}
    </div>
  );
}
