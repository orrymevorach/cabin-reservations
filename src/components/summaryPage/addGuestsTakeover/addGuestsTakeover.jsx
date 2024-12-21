import Takeover from '@/components/shared/takeover/takeover';
import styles from './addGuestsTakeover.module.scss';
import AddGuests from '@/components/shared/addGuests/addGuests';
import { useReservation } from '@/context/reservation-context';
import { useRouter } from 'next/router';
import { useUser } from '@/context/user-context';
import { ROUTES } from '@/utils/constants';
import VerifiedUsers from '@/components/shared/verifiedUsers/verifiedUsers';
import {
  createUser,
  getCabinById,
  getUserByEmail,
  reserveSpotInCabin,
} from '@/lib/airtable';
import clsx from 'clsx';
import {
  createOrUpdateGroup,
  verifyEmail,
} from '@/components/shared/addGuests/inputVerify/inputVerify';
import { sendConfirmationEmail } from '@/lib/mailgun';
import { sendSlackNotification } from '@/lib/slack';

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
    // Check that user does not already exist
    const userResponse = await getUserByEmail({ email });
    const hasUser = userResponse && userResponse.id;
    if (hasUser) {
      return {
        error:
          'We already have a ticket associated with this email. Please enter a new email.',
        user: null,
      };
    }
    // Create ticker for new user
    const newUser = await createUser({
      name: `${firstName} ${lastName}`,
      email,
      cabinId: cabinData.cabin.id,
    });

    // Add user to existing group, or create new group if none exists
    const hasGroup = groupData.members?.length;
    const usersToAdd = hasGroup
      ? [...groupData.members, newUser]
      : [user, newUser];
    const updatedGroupData = await createOrUpdateGroup({
      users: usersToAdd,
      groupData,
    });

    // Send confirmation email
    await sendConfirmationEmail({
      groupMember: newUser,
      cabin: cabinData.cabin.id,
      host: user,
    });

    // Get updated cabin data
    const cabin = await getCabinById({ cabinId: cabinData.cabin.id });

    try {
      // Slack Notification
      await sendSlackNotification({
        originalGuestName: user.name,
        newGuestName: `${firstName} ${lastName}`,
        email,
        cabin: cabin.name,
      });
    } catch (error) {
      console.error('Slack Notification Failed:', error);
    }

    // Update state
    dispatch({
      type: actions.UPDATE_GROUP,
      groupData: updatedGroupData,
      numberOfMembersNotConfirmedInCurrentCabin:
        numberOfMembersNotConfirmedInCurrentCabin + 1,
      cabin,
    });

    // Add focus on firstname input
    ref?.current?.focus();

    return { error: null };
  }

  async function handleAddGuest({ email, ref }) {
    const userResponse = await getUserByEmail({ email });
    // Check that user does not already exist, and does not have a group or cabin
    const { error } = await verifyEmail({ user: userResponse, groupData });
    if (error) return { error };

    // Add user to existing group, or create new group if none exists
    const hasGroup = groupData.members?.length;
    const usersToAdd = hasGroup
      ? [...groupData.members, userResponse]
      : [user, userResponse];
    const updatedGroupData = await createOrUpdateGroup({
      users: usersToAdd,
      groupData,
    });

    // Add user to cabin
    await reserveSpotInCabin({
      cabinId: cabinData.cabin.id,
      attendeeId: userResponse.id,
    });

    // Send confirmation email
    await sendConfirmationEmail({
      groupMember: userResponse,
      cabin: cabinData.cabin.id,
      host: user,
    });

    // Get updated cabin data
    const cabin = await getCabinById({ cabinId: cabinData.cabin.id });

    // Update state
    dispatch({
      type: actions.UPDATE_GROUP,
      groupData: updatedGroupData,
      numberOfMembersNotConfirmedInCurrentCabin:
        numberOfMembersNotConfirmedInCurrentCabin + 1,
      cabin,
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
              !allowCreateNewUser && styles.height
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
