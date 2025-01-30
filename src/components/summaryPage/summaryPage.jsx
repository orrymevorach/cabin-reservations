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

export default function SummaryPage() {
  const { user, isLoading: isUserDataLoading } = useUser();
  const router = useRouter();
  const {
    currentStage,
    dispatch,
    actions,
    groupData: { members },
    cabin,
  } = useReservation();

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
  const isPurchasedCabin = user?.status === 'Cabin Purchased';
  const isPurchasedCabinHalfFull =
    isPurchasedCabin && cabinData.cabin.reservedBeds >= 12;
  const allowCreateNewUser = isPurchasedCabin && !isPurchasedCabinHalfFull;

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
        {members?.length > 1 && <VerifiedUsers hideRemoveButton />}
      </div>
      <ModifyReservationButtons />
    </div>
  );
}
