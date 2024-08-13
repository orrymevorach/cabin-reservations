import Takeover from '@/components/shared/takeover/takeover';
import styles from './bookingAssistant.module.scss';
import { useCabinSelection } from '@/context/cabin-selection-context';
import { useState } from 'react';
import StageOne from './stageOne/stageOne';
// import StageTwo from './stageTwo/stageTwo';
import StageFour from './stageFour/stageFour';
import CabinCategories from '../cabinCategories/cabinCategories';

export default function BookingAssistant() {
  const { dispatch, actions } = useCabinSelection();
  const [stage, setStage] = useState(1);

  return (
    <Takeover
      handleClose={() => dispatch({ type: actions.CLOSE_BOOKING_ASSISTANT })}
      modalClassNames={styles.takeover}
    >
      {stage === 1 && <StageOne setStage={setStage} />}
      {/* {stage === 2 && <StageTwo setStage={setStage} />} */}
      {stage === 3 && (
        <CabinCategories
          setStage={setStage}
          title="I want to live in a cabin that is..."
        />
      )}
      {stage === 4 && <StageFour setStage={setStage} />}
    </Takeover>
  );
}
