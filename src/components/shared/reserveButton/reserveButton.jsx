import styles from './reserveButton.module.scss';
import Button from '@/components/shared/button/button';
import { useReservation } from '@/context/reservation-context';
import { CABIN_SELECTION_STAGES } from '@/hooks/useReservation';
import { reserveSpotInCabin } from '@/lib/airtable';
import { useRouter } from 'next/router';
import { useState } from 'react';
import clsx from 'clsx';
import { sendConfirmationEmail } from '@/lib/mailgun';

export default function ReserveButton({ children, cabin, classNames = '' }) {
  const { groupData, dispatch, actions } = useReservation();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const groupMembers = groupData.members;
  const cabinId = cabin.id;

  const reserveCabinForGroupMembers = async () => {
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
          const response = await reserveSpotInCabin({
            cabinId,
            attendeeId: groupMember.id,
          });
        }
      }

      setIsLoading(false);
      dispatch({
        type: actions.SET_SELECTION_STAGE,
        currentStage: CABIN_SELECTION_STAGES.CONFIRMATION,
      });
      // await sendConfirmationEmail({ groupMembers, cabin, selectedBeds });

      router.push({
        query: {
          stage: CABIN_SELECTION_STAGES.CONFIRMATION,
        },
      });
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <Button
      handleClick={reserveCabinForGroupMembers}
      isLoading={isLoading}
      classNames={clsx(styles.continueButton, classNames)}
    >
      {children || 'Confirm reservation'}
    </Button>
  );
}
