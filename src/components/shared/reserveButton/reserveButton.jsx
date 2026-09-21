import styles from './reserveButton.module.scss';
import Button from '@/components/shared/button/button';
import { useReservation } from '@/context/reservation-context';
import { CABIN_SELECTION_STAGES } from '@/hooks/useReservation';
import { useRouter } from 'next/router';
import { useState } from 'react';
import clsx from 'clsx';
import { useUser } from '@/context/user-context';
import { reserveCabin } from '@/lib/platform-api';

export default function ReserveButton({ children, cabin, classNames = '' }) {
  const { user } = useUser();
  const { groupData, dispatch, actions, selectedBeds } = useReservation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const groupMembers = groupData.members;
  const cabinId = cabin.id;

  const reserveCabinForGroupMembers = async () => {
    setError('');
    setIsLoading(true);
    try {
      const response = await reserveCabin({
        cabinId,
        groupMemberIds: groupMembers.map(({ id }) => id),
        hostUserId: user.id,
        selectedBeds,
      });

      if (response.message) {
        setError(response.message);
        setIsLoading(false);
        return;
      }

      dispatch({
        type: actions.SET_SELECTION_STAGE,
        currentStage: CABIN_SELECTION_STAGES.CONFIRMATION,
      });

      router.push({
        query: {
          cabin: cabin.name,
          stage: CABIN_SELECTION_STAGES.CONFIRMATION,
        },
      });
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };
  return (
    <>
      {error && <p className={styles.error}>{error}</p>}
      <Button
        handleClick={reserveCabinForGroupMembers}
        isLoading={isLoading}
        classNames={clsx(styles.continueButton, classNames)}
        isBlue
      >
        {children || 'Confirm reservation'}
      </Button>
    </>
  );
}
