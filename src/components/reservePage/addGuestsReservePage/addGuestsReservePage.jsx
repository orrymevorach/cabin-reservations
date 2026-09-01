import AddGuests from '@/components/shared/addGuests/addGuests';
import Button from '@/components/shared/button/button';
import { ROUTES } from '@/utils/constants';
import styles from './addGuestsReservePage.module.scss';
import { useReservation } from '@/context/reservation-context';
import useWindowSize from '@/hooks/useWindowSize';
import { addGroupMember } from '@/lib/platform-api';
import { useUser } from '@/context/user-context';

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
    const response = await addGroupMember({
      groupId: groupData.id,
      hostUserId: user.id,
      memberIds: groupData.members?.map(({ id }) => id) || [],
      email,
    });
    if (response.message) return { error: response.message };

    // Update state
    dispatch({
      type: actions.UPDATE_GROUP,
      groupData: response.group,
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
          <Button classNames={styles.button} href='#sidebar'>
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
