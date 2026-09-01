import Takeover from '@/components/shared/takeover/takeover';
import styles from './addGuestsTakeover.module.scss';
import AddGuests from '@/components/shared/addGuests/addGuests';
import { useReservation } from '@/context/reservation-context';
import { useRouter } from 'next/router';
import { useUser } from '@/context/user-context';
import { ROUTES } from '@/utils/constants';
import VerifiedUsers from '@/components/shared/verifiedUsers/verifiedUsers';
import { addGroupMember, createGroupMember } from '@/lib/platform-api';
import clsx from 'clsx';

export default function AddGuestsTakeover({ allowCreateNewUser }) {
  const {
    dispatch,
    actions,
    groupData,
    cabin,
    cabinData,
    numberOfMembersNotConfirmedInCurrentCabin,
  } = useReservation();
  const { user } = useUser();

  const router = useRouter();
  const handleClose = () => {
    dispatch({ type: actions.SET_SELECTION_STAGE });
    router.push({ pathname: ROUTES.SUMMARY }, undefined, {
      shallow: true,
    });
  };

  async function handleCreateGuest({ email, firstName, lastName, ref }) {
    const response = await createGroupMember({
      groupId: groupData.id,
      hostUserId: user.id,
      memberIds: groupData.members?.map(({ id }) => id) || [],
      email,
      firstName,
      lastName,
      cabinId: cabinData.cabin.id,
    });
    if (response.message) return { error: response.message };

    dispatch({
      type: actions.UPDATE_GROUP,
      groupData: response.group,
      numberOfMembersNotConfirmedInCurrentCabin:
        numberOfMembersNotConfirmedInCurrentCabin + 1,
      cabin: response.cabin,
    });

    // Add focus on firstname input
    ref?.current?.focus();

    return { error: null };
  }

  async function handleAddGuest({ email, ref }) {
    const response = await addGroupMember({
      groupId: groupData.id,
      hostUserId: user.id,
      memberIds: groupData.members?.map(({ id }) => id) || [],
      email,
      cabinId: cabinData.cabin.id,
    });
    if (response.message) return { error: response.message };

    dispatch({
      type: actions.UPDATE_GROUP,
      groupData: response.group,
      numberOfMembersNotConfirmedInCurrentCabin:
        numberOfMembersNotConfirmedInCurrentCabin + 1,
      cabin: response.cabin,
    });

    // Add focus on email input
    ref?.current?.focus();

    return { error: null };
  }

  const handleSubmit = allowCreateNewUser ? handleCreateGuest : handleAddGuest;

  return (
    <>
      <Takeover handleClose={handleClose}>
        <div className={styles.takeover}>
          <AddGuests
            cabin={cabin}
            classNames={clsx(
              styles.addGuests,
              !allowCreateNewUser && styles.height,
            )}
            hideBackButton
            handleSubmit={handleSubmit}
            allowCreateNewUser={allowCreateNewUser}
          />
          <VerifiedUsers hideRemoveButton />
        </div>
      </Takeover>
    </>
  );
}

