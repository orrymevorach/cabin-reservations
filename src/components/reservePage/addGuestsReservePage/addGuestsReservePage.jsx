import AddGuests from '@/components/shared/addGuests/addGuests';
import Button from '@/components/shared/button/button';
import { ROUTES } from '@/utils/constants';
import styles from './addGuestsReservePage.module.scss';
import { useReservation } from '@/context/reservation-context';
import useWindowSize from '@/hooks/useWindowSize';
import { getUserByEmail } from '@/lib/airtable';
import { useUser } from '@/context/user-context';
import {
  createOrUpdateGroup,
  verifyEmail,
} from '@/components/shared/addGuests/inputVerify/inputVerify';

export default function AddGuestsReservePage() {
  const {
    cabinData,
    groupData,
    numberOfMembersNotConfirmedInCurrentCabin,
    dispatch,
    actions,
  } = useReservation();
  const cabin = cabinData.cabin;
  const { isMobile } = useWindowSize();
  const { user } = useUser();

  async function handleSubmit({ email, ref }) {
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

    // Update state
    dispatch({
      type: actions.UPDATE_GROUP,
      groupData: updatedGroupData,
      numberOfMembersNotConfirmedInCurrentCabin:
        numberOfMembersNotConfirmedInCurrentCabin + 1,
    });

    // Add focus on email input
    ref?.current?.focus();

    return { error: null };
  }
  return (
    <>
      <AddGuests cabin={cabin} handleSubmit={handleSubmit} />
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
