import styles from './reserveButton.module.scss';
import Button from '@/components/shared/button/button';
import { useReservation } from '@/context/reservation-context';
import { CABIN_SELECTION_STAGES } from '@/hooks/useReservation';
import { clearCurrentBedSelection, reserveSpotInCabin } from '@/lib/airtable';
import { useRouter } from 'next/router';
import { useState } from 'react';
import clsx from 'clsx';
import { sendConfirmationEmail } from '@/lib/emails';
import { useUser } from '@/context/user-context';

export default function ReserveButton({ children, cabin, classNames = '' }) {
  const { user } = useUser();
  const { groupData, dispatch, actions, selectedBeds } = useReservation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const groupMembers = groupData.members;
  const cabinId = cabin.id;
  const isYurt = cabin.unit?.[0] === 'Yurtlands';

  const reserveCabinForGroupMembers = async () => {
    if (isYurt && user.status !== 'Yurt') {
      setError('You must have purchased a Yurt in order to reserve one.');
      return;
    }
    if (!isYurt && user.status === 'Yurt') {
      setError('Yurt ticket holders can only reserve a yurt in Yurtlands.');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      for (let i = 0; i < groupMembers.length; i++) {
        const groupMember = groupMembers[i];
        const userHasNoPrevioulsyReservedCabin = !groupMember.cabin;
        const usersExistingCabinIsDifferentThenCurrentCabin =
          groupMember.cabin && groupMember.cabin.id !== cabinId;
        // Reserving a spot in a cabin clears your existing bed selection.
        // Setting these conditions so as not to affect the reservation of people already in this cabin.
        if (
          userHasNoPrevioulsyReservedCabin ||
          usersExistingCabinIsDifferentThenCurrentCabin
        ) {
          await clearCurrentBedSelection({ userId: groupMember.id });
          await reserveSpotInCabin({
            cabinId,
            attendeeId: groupMember.id,
          });
          await sendConfirmationEmail({
            groupMember,
            cabin,
            selectedBeds,
            host: user,
          });
        }
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
