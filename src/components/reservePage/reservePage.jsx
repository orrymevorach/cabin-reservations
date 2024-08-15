import { useReservation } from '@/context/reservation-context';
import Sidebar from '../cabinSelectionPage/sidebar/sidebar';
import { Logo } from '../shared/layout/layout';
import styles from './reservePage.module.scss';
import { CABIN_SELECTION_STAGES } from '@/hooks/useReservation';
import Confirmation from './confirmation/confirmation';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Loader from '../shared/loader/loader';
import AddGuestsReservePage from './addGuestsReservePage/addGuestsReservePage';
import SelectCabinTakeover from './selectCabinTakeover/selectCabinTakeover';

const useSetStageBasedOnQuery = () => {
  const [showSelectCabinTakeover, setShowSelectCabinTakeover] = useState(false);
  const { actions, dispatch } = useReservation();
  const { ADD_GUESTS } = CABIN_SELECTION_STAGES;
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      const { cabin, stage } = router.query;
      // If no cabin query, prompt redirect to cabin selection page
      if (!cabin && stage === ADD_GUESTS) {
        setShowSelectCabinTakeover(true);
      }

      // If no stage query, set as "add guests" stage
      if (!stage) {
        dispatch({
          type: actions.SET_SELECTION_STAGE,
          currentStage: ADD_GUESTS,
        });
      }
      // If stage query exists, set stage based on query
      else {
        dispatch({
          type: actions.SET_SELECTION_STAGE,
          currentStage: stage,
        });
      }
    }
  }, [router, ADD_GUESTS, actions, dispatch]);

  return { showSelectCabinTakeover };
};

export default function ReservePage() {
  const { currentStage, cabinData } = useReservation();
  const { ADD_GUESTS, CONFIRMATION } = CABIN_SELECTION_STAGES;
  const { showSelectCabinTakeover } = useSetStageBasedOnQuery();
  if (!currentStage) return <Loader isDotted />;
  return (
    <div className={styles.sideMargins}>
      {showSelectCabinTakeover && <SelectCabinTakeover />}
      <Logo classNames={styles.logo} />
      <div className={styles.container}>
        {currentStage === ADD_GUESTS && <AddGuestsReservePage />}
        {currentStage === CONFIRMATION && <Confirmation />}
        <Sidebar cabinData={cabinData} />
      </div>
    </div>
  );
}
