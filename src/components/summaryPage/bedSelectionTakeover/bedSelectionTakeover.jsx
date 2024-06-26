import Takeover from '@/components/shared/takeover/takeover';
import styles from './bedSelectionTakeover.module.scss';
import BedSelection from '@/components/shared/bedSelection/bedSelection';
import { useReservation } from '@/context/reservation-context';
import { useRouter } from 'next/router';
import { ROUTES } from '@/utils/constants';
import { useUser } from '@/context/user-context';

export default function BedSelectionTakeover() {
  const { dispatch, actions } = useReservation();
  const router = useRouter();
  const { user } = useUser();
  const cabin = user.cabin;

  const handleClose = () => {
    dispatch({ type: actions.SET_SELECTION_STAGE });
    router.push({ pathname: ROUTES.SUMMARY }, undefined, {
      shallow: true,
    });
  };
  return (
    <Takeover handleClose={handleClose}>
      <div className={styles.takeover}>
        <BedSelection cabin={cabin} />
      </div>
    </Takeover>
  );
}
