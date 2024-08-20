import Takeover from '@/components/shared/takeover/takeover';
import { ROUTES } from '@/utils/constants';
import Confirmation from '@/components/reservePage/confirmation/confirmation';
import { useRouter } from 'next/router';
import { useReservation } from '@/context/reservation-context';
import styles from './confirmationTakeover.module.scss';

export default function ConfirmationTakeover() {
  const router = useRouter();
  const { dispatch, actions } = useReservation();

  const handleClose = () => {
    dispatch({ type: actions.SET_SELECTION_STAGE });
    router.push({ pathname: ROUTES.SUMMARY }, undefined, {
      shallow: true,
    });
  };
  return (
    <Takeover handleClose={handleClose}>
      <Confirmation isSummaryPage classNames={styles.confirmation} />
    </Takeover>
  );
}
