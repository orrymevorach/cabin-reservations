import { useReservation } from '@/context/reservation-context';
import { useEffect, useState } from 'react';
import Takeover from '@/components/shared/takeover/takeover';
import styles from './headStaffCabinMessageTakeover.module.scss';
import clsx from 'clsx';
import Button from '@/components/shared/button/button';

export default function HeadStaffCabinMessageTakeover() {
  const { cabinData } = useReservation();
  const isHeadStaffCabin = cabinData?.cabin?.bedConfiguration === 'Head Staff';
  const [showHeadStaffMessage, setShowHeadStaffMessage] = useState(false);

  useEffect(() => {
    if (isHeadStaffCabin) {
      setShowHeadStaffMessage(true);
    }
  }, [isHeadStaffCabin]);

  return showHeadStaffMessage ? (
    <Takeover
      handleClose={() => setShowHeadStaffMessage(false)}
      modalClassNames={styles.modal}
    >
      <div>
        <p className={clsx(styles.line, styles.title)}>
          A note about Head Staff Cabins
        </p>
        <p className={styles.line}>
          Since head staff cabins are a very limited option, you will only be
          able to reserve them if there are three people in your group. Please
          ensure that all three members of your group have bought tickets, and
          add each of them as a guest in order to confirm the reservation.
        </p>

        <Button
          classNames={styles.button}
          handleClick={() => setShowHeadStaffMessage(false)}
        >
          Close
        </Button>
      </div>
    </Takeover>
  ) : null;
}
