import Button from '@/components/shared/button/button';
import { CABIN_SELECTION_STAGES } from '@/hooks/useReservation';
import { ROUTES } from '@/utils/constants';
import styles from './modifyReservationButtons.module.scss';
import { useRouter } from 'next/router';
import useAllowBedSelection from '@/hooks/useAllowBedSelection';

export default function ModifyReservationButtons() {
  const router = useRouter();
  const handleRoute = ({ pathname, stage }) => {
    const query = stage ? { stage } : null;
    router.push({
      pathname,
      query,
    });
  };
  const allowBedSelection = useAllowBedSelection();
  return (
    <div className={styles.modifyContainer}>
      <p className={styles.title}>Modify Your Reservation</p>
      <div className={styles.buttons}>
        <Button
          classNames={styles.button}
          handleClick={() =>
            handleRoute({
              stage: CABIN_SELECTION_STAGES.ADD_GUESTS,
            })
          }
        >
          Add Guests / Modify Group
        </Button>
        {allowBedSelection && (
          <Button
            classNames={styles.button}
            handleClick={() =>
              handleRoute({
                stage: CABIN_SELECTION_STAGES.BED_SELECTION,
              })
            }
          >
            Select Beds
          </Button>
        )}
        <Button
          classNames={styles.button}
          isAnchor
          href={ROUTES.CABIN_SELECTION}
        >
          Change Cabin/Unit
        </Button>
      </div>
    </div>
  );
}
