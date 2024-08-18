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
import SelectCabinTakeover from '../reservePage/selectCabinTakeover/selectCabinTakeover';

export default function SummaryPage() {
  const { user, isLoading: isUserDataLoading } = useUser();
  const router = useRouter();
  const {
    currentStage,
    dispatch,
    actions,
    groupData: { members },
  } = useReservation();

  const stageQuery = router.query.stage;
  useEffect(() => {
    if (stageQuery) {
      dispatch({ type: actions.SET_SELECTION_STAGE, currentStage: stageQuery });
    }
  }, [stageQuery, dispatch, actions]);

  if (isUserDataLoading || !user) return <Loader isDotted />;
  const cabinData = {
    cabin: user.cabin,
    isLoading: isUserDataLoading,
  };

  const hasCabin = !!user.cabin;
  if (user && !hasCabin) return <SelectCabinTakeover />;

  return (
    <div className={styles.container}>
      {currentStage === CABIN_SELECTION_STAGES.ADD_GUESTS && (
        <AddGuestsTakeover />
      )}
      {currentStage === CABIN_SELECTION_STAGES.BED_SELECTION && (
        <BedSelectionTakeover />
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
