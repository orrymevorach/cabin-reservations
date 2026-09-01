import { useUser } from '@/context/user-context';
import Loader from '../shared/loader/loader';
import styles from './summaryPage.module.scss';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { CABIN_SELECTION_STAGES } from '@/hooks/useReservation';
import BedSelectionTakeover from './bedSelectionTakeover/bedSelectionTakeover';
import ModifyReservationButtons from './modifyReservationButtons/modifyReservationButtons';
import { useReservation } from '@/context/reservation-context';
import ReservationSummary from '../shared/reservationSummary/reservationSummary';
import VerifiedUsers from '../shared/verifiedUsers/verifiedUsers';
import AddGuestsTakeover from './addGuestsTakeover/addGuestsTakeover';
import ConfirmationTakeover from './confirmationTakeover/confirmationTakeover';

const FREE_TICKET_ALLOWANCES = {
  'Cabin Purchased': 14,
  '5 Ticket GA Bundle': 4,
  '6 Ticket GA Bundle': 5,
  '7 Ticket GA Bundle': 6,
  Yurt: 1,
};

export default function SummaryPage() {
  const { user, isLoading: isUserDataLoading } = useUser();
  const router = useRouter();
  const { currentStage, dispatch, actions, cabin, groupData } =
    useReservation();

  const stageQuery = router.query.stage;
  useEffect(() => {
    if (stageQuery) {
      dispatch({ type: actions.SET_SELECTION_STAGE, currentStage: stageQuery });
    }
  }, [stageQuery, dispatch, actions]);

  if (isUserDataLoading || !user) return <Loader isDotted />;
  const cabinData = {
    cabin,
    isLoading: isUserDataLoading,
  };

  // If a cabin is purchased, we allow users to add guests with free tickets
  // Once a cabin is half full, users can no longer add guests with free tickets, but they can add guests with purchased tickets

  const freeTicketAllowance = FREE_TICKET_ALLOWANCES[user?.status];
  const numberOfAddedGuests = Math.max(
    (groupData?.members?.length || 1) - 1,
    0,
  );
  const hasAvailableBundleTickets =
    freeTicketAllowance !== undefined &&
    numberOfAddedGuests < freeTicketAllowance;
  const allowCreateNewUser = hasAvailableBundleTickets;

  return (
    <div className={styles.container}>
      {currentStage === CABIN_SELECTION_STAGES.ADD_GUESTS && (
        <AddGuestsTakeover allowCreateNewUser={allowCreateNewUser} />
      )}
      {currentStage === CABIN_SELECTION_STAGES.BED_SELECTION && (
        <BedSelectionTakeover />
      )}
      {currentStage === CABIN_SELECTION_STAGES.CONFIRMATION && (
        <ConfirmationTakeover />
      )}

      <div>
        <div className={styles.titleContainer}>
          <p className={styles.title}>Summary</p>
        </div>
        <ReservationSummary cabinData={cabinData} showBedSelection />
        <VerifiedUsers hideRemoveButton />
      </div>
      <ModifyReservationButtons />
    </div>
  );
}
