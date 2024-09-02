import AddGuests from '@/components/shared/addGuests/addGuests';
import Button from '@/components/shared/button/button';
import { ROUTES } from '@/utils/constants';
import styles from './addGuestsReservePage.module.scss';
import { useReservation } from '@/context/reservation-context';
import useWindowSize from '@/hooks/useWindowSize';

export default function AddGuestsReservePage() {
  const { cabinData } = useReservation();
  const cabin = cabinData.cabin;
  const { isMobile } = useWindowSize();
  return (
    <>
      <AddGuests cabin={cabin} />
      {isMobile && (
        <>
          <p className={styles.or}>Or</p>
          <Button classNames={styles.button} href="#sidebar">
            Continue
          </Button>
        </>
      )}

      <Button classNames={styles.button} href={ROUTES.CABIN_SELECTION}>
        Back to cabin selection
      </Button>
    </>
  );
}
