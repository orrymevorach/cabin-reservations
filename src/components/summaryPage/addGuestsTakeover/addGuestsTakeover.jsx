import Takeover from '@/components/shared/takeover/takeover';
import styles from './addGuestsTakeover.module.scss';
import AddGuests from '@/components/shared/addGuests/addGuests';
import Button from '@/components/shared/button/button';
import ReserveButton from '@/components/shared/reserveButton/reserveButton';
import { useReservation } from '@/context/reservation-context';
import { useRouter } from 'next/router';
import { useUser } from '@/context/user-context';
import { ROUTES } from '@/utils/constants';
import VerifiedUsers from '@/components/shared/verifiedUsers/verifiedUsers';
import { useState } from 'react';
import { updateGroup } from '@/lib/airtable';

export default function AddGuestsTakeover() {
  const { dispatch, actions, groupData } = useReservation();
  const { user } = useUser();
  const cabin = user.cabin;
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const handleClose = () => {
    dispatch({ type: actions.SET_SELECTION_STAGE });
    router.push({ pathname: ROUTES.SUMMARY }, undefined, {
      shallow: true,
    });
  };

  const handleLeaveGroup = async () => {
    setIsLoading(true);

    const remainingMembers = groupData.members.filter(
      ({ id }) => id !== user.id
    );
    const memberRecordIds = remainingMembers.map(({ id }) => id);

    await updateGroup({ groupId: groupData.id, members: memberRecordIds });
    groupData.id = '';
    groupData.members = [user];
    dispatch({
      type: actions.UPDATE_GROUP,
      groupData,
    });
    setIsLoading(false);
  };
  return (
    <>
      <Takeover handleClose={handleClose}>
        <div className={styles.takeover}>
          <AddGuests
            cabin={cabin}
            classNames={styles.addGuests}
            hideBackButton
          />
          <VerifiedUsers hideRemoveButton />
        </div>
        <div className={styles.bottomRow}>
          <ReserveButton cabin={cabin} classNames={styles.button}>
            Update Reservation
          </ReserveButton>
          <Button isLoading={isLoading} handleClick={handleLeaveGroup}>
            Leave Group
          </Button>
        </div>
      </Takeover>
    </>
  );
}
