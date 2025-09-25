import Button from '@/components/shared/button/button';
import { CABIN_SELECTION_STAGES } from '@/hooks/useReservation';
import styles from './modifyReservationButtons.module.scss';
import { useRouter } from 'next/router';
import useAllowBedSelection from '@/hooks/useAllowBedSelection';
import Takeover from '@/components/shared/takeover/takeover';
import { useUser } from '@/context/user-context';
import { useState } from 'react';

export default function ModifyReservationButtons() {
  const [showTakeover, setShowTakeover] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  const handleRoute = ({ pathname, stage }) => {
    const query = stage ? { stage } : null;
    router.push({
      pathname,
      query,
    });
  };

  const allowBedSelection = useAllowBedSelection();
  const remainingBalanceProductId = user?.remainingBalanceProduct
    ? user?.remainingBalanceProduct[0]
    : '';

  return (
    <div className={styles.modifyContainer}>
      {showTakeover && (
        <Takeover handleClose={() => setShowTakeover(false)}>
          <p>
            Since you have prepaid for your cabin, please contact us to change
            your cabin. Please email us at info@highlandsmusicfestival.ca
          </p>
          <p>
            We apologize for the inconvenince, and look forward to helping you
            sort this out!
          </p>
        </Takeover>
      )}
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

        {/* {remainingBalanceProductId ? (
          <Button
            classNames={styles.button}
            handleClick={() => setShowTakeover(true)}
          >
            Change Cabin/Unit
          </Button>
        ) : (
          <Button
            classNames={styles.button}
            isAnchor
            href={ROUTES.CABIN_SELECTION}
          >
            Change Cabin/Unit
          </Button>
        )} */}

        {remainingBalanceProductId && (
          <Button
            classNames={styles.button}
            isAnchor
            href={`https://highlandsmusicfestival.ca/checkout?productId=${remainingBalanceProductId}`}
            target="_blank"
          >
            Complete Payment
          </Button>
        )}
      </div>
    </div>
  );
}
