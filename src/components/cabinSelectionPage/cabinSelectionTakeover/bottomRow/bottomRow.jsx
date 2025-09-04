import { useState } from 'react';
import Button from '@/components/shared/button/button';
import styles from './bottomRow.module.scss';
import { useCabinSelection } from '@/context/cabin-selection-context';
import Loader from '@/components/shared/loader/loader';
import { useRouter } from 'next/router';
import { ROUTES } from '@/utils/constants';
import { CABIN_SELECTION_STAGES } from '@/hooks/useReservation';

export default function BottomRow({ showBedSelection, setShowBedSelection }) {
  const { selectedCabin, dispatch, actions } = useCabinSelection();

  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const handleClick = async () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push({
        pathname: ROUTES.RESERVE,
        query: {
          cabin: selectedCabin.name,
          stage: CABIN_SELECTION_STAGES.ADD_GUESTS,
        },
      });
    }, 500);
  };

  if (isLoading) {
    return (
      <div className={styles.overlay}>
        <Loader isDotted classNames={styles.loader} />
      </div>
    );
  }

  return (
    <div className={styles.bottomRow}>
      <div className={styles.leftContainer}>
        <Button
          handleClick={() => dispatch({ type: actions.CLOSE_CABIN_SELECTION })}
        >
          Close
        </Button>
        <Button
          handleClick={() => setShowBedSelection(!showBedSelection)}
          classNames={styles.viewBedSelectionButton}
        >
          {showBedSelection
            ? 'Back to cabin information'
            : 'View available beds'}
        </Button>
      </div>
      <Button isBlue handleClick={handleClick}>
        Continue
      </Button>
    </div>
  );
}
