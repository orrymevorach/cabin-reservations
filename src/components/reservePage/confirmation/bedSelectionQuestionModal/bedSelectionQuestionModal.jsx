import Button from '@/components/shared/button/button';
import Takeover from '@/components/shared/takeover/takeover';
import { CABIN_SELECTION_STAGES } from '@/hooks/useReservation';
import { ROUTES } from '@/utils/constants';
import styles from './bedSelectionQuestionModal.module.scss';
import clsx from 'clsx';

export default function BedSelectionQuestionModal({ handleClose }) {
  return (
    <Takeover handleClose={handleClose} modalClassNames={styles.modal}>
      <p>Would you like to select a bed?</p>
      <div className={styles.container}>
        <Button
          href={`${ROUTES.SUMMARY}?stage=${CABIN_SELECTION_STAGES.BED_SELECTION}`}
          isAnchor
          classNames={clsx(styles.button, styles.continueButton)}
          isBlue
        >
          Continue to bed selection
        </Button>
        <Button handleClick={handleClose} classNames={styles.button}>
          Skip this step
        </Button>
      </div>
    </Takeover>
  );
}
