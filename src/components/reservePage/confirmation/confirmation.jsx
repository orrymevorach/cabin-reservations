import styles from './confirmation.module.scss';
import Button from '@/components/shared/button/button';
import { ROUTES } from '@/utils/constants';
import BedSelectionQuestionModal from './bedSelectionQuestionModal/bedSelectionQuestionModal';
import { useState } from 'react';
import useAllowBedSelection from '@/hooks/useAllowBedSelection';

export default function Confirmation() {
  const [showQuestionModal, setShowQuestionModal] = useState(true);
  const allowBedSelection = useAllowBedSelection();
  return (
    <>
      <div className={styles.container}>
        <p className={styles.title}>Confirmed!</p>
        <p className={styles.text}>
          You are all done! We have sent a confirmation email with your
          reservation details to all guests on the reservation.
        </p>
        <p className={styles.text}>
          If you would like to modify your reservation by adding guests,
          selecting beds, or changing cabins, please click the &quot;View
          Summary&quot; button below.
        </p>
        <p className={styles.text}>See you at Highlands!</p>
        <div className={styles.buttonsContainer}>
          <Button classNames={styles.button} href={ROUTES.SUMMARY}>
            View summary
          </Button>
        </div>
      </div>
      {showQuestionModal && allowBedSelection && (
        <BedSelectionQuestionModal
          handleClose={() => setShowQuestionModal(false)}
        />
      )}
    </>
  );
}
