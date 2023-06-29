import styles from './bedSelection.module.scss';
import { useReservation } from '@/context/reservation-context';
import Button from '@/components/shared/button/button';
import { useState } from 'react';
import Cabin from './cabin/cabin';
import { useUser } from '@/context/user-context';
import { clearCurrentBedSelection, reserveBed } from '@/lib/airtable';

export default function BedSelection() {
  const [isLoading, setIsLoading] = useState(false);
  const { selectedBeds, dispatch, actions } = useReservation();
  const { user } = useUser();
  const cabin = user.cabin[0];

  const handleClick = async () => {
    setIsLoading(true);
    for (let i = 0; i < selectedBeds.length; i++) {
      const { bedName, id } = selectedBeds[i];
      await clearCurrentBedSelection({ userId: id });
      const response = await reserveBed({
        userId: id,
        [bedName]: cabin.id,
      });
    }
    setIsLoading(false);
    window.location = '/summary?stage=BED_SELECTION';
  };

  const handleReset = () => {
    dispatch({ type: actions.SELECT_BEDS, selectedBeds: [] });
  };

  return (
    <div className={styles.bedSelectionContainer}>
      <Cabin />
      <div className={styles.buttons}>
        <Button
          handleClick={handleClick}
          isLoading={isLoading}
          classNames={styles.button}
        >
          Confirm Beds
        </Button>
        <Button handleClick={handleReset} classNames={styles.button}>
          Reset
        </Button>
      </div>
    </div>
  );
}
