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
import { hasIncludedGuestTicketRemaining } from '@/utils/ticket-utils';

export default function SummaryPage() {
  const { user, isLoading: isUserDataLoading } = useUser();
  const router = useRouter();
  const {
    currentStage,
    dispatch,
    actions,
    cabin,
    groupData,
    remainingPurchasedTicketCount,
  } = useReservation();

  const stageQuery = router.query.stage;
  // Open the reservation editor requested by the profile page's stage query parameter.
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

  const canCreateGuestWithinIncludedTicketAllowance =
    hasIncludedGuestTicketRemaining({
      status: user?.status,
      groupMemberCount: groupData?.members?.length,
    });
  return (
    <div className={styles.container}>
      {currentStage === CABIN_SELECTION_STAGES.ADD_GUESTS && (
        <AddGuestsTakeover
          canCreateGuestWithinIncludedTicketAllowance={
            canCreateGuestWithinIncludedTicketAllowance
          }
          remainingPurchasedTicketCount={remainingPurchasedTicketCount}
        />
      )}
      {currentStage === CABIN_SELECTION_STAGES.BED_SELECTION && (
        <BedSelectionTakeover />
      )}
      {currentStage === CABIN_SELECTION_STAGES.CONFIRMATION && (
        <ConfirmationTakeover />
      )}

      <div className={styles.details}>
        <ReservationSummary
          cabinData={cabinData}
          showBedSelection
          classNames={styles.cabinDetails}
        />
        <VerifiedUsers hideRemoveButton classNames={styles.guestList} />
      </div>
      <ModifyReservationButtons />
    </div>
  );
}
