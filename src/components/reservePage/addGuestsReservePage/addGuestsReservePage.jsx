import AddGuests from '@/components/shared/addGuests/addGuests';
import Button from '@/components/shared/button/button';
import { ROUTES } from '@/utils/constants';
import styles from './addGuestsReservePage.module.scss';
import { useReservation } from '@/context/reservation-context';
import useWindowSize from '@/hooks/useWindowSize';
import {
  addGroupMember,
  assignPurchasedTicketToGroupMember,
} from '@/lib/platform-api';
import { useUser } from '@/context/user-context';
import { getUserByEmail } from '@/lib/airtable';

export default function AddGuestsReservePage() {
  const {
    cabinData,
    groupData,
    numberOfMembersNotConfirmedInCurrentCabin,
    remainingPurchasedTicketCount,
    dispatch,
    actions,
  } = useReservation();
  const cabin = cabinData.cabin;
  const { isMobile } = useWindowSize();
  const { user } = useUser();
  const canAssignPurchasedTicket = remainingPurchasedTicketCount > 0;

  async function handleAddGuestToGroup({ email, ref }) {
    const response = await addGroupMember({
      groupId: groupData.id,
      hostUserId: user.id,
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

  async function handleCreatePurchasedGuest({
    email,
    firstName,
    lastName,
    ref,
  }) {
    const existingGuest = await getUserByEmail({ email });
    if (existingGuest?.id) return handleAddGuestToGroup({ email, ref });

    const response = await assignPurchasedTicketToGroupMember({
      groupId: groupData.id,
      hostUserId: user.id,
      email,
      firstName,
      lastName,
    });
    if (response.error || response.message) {
      return { error: response.error || response.message };
    }

    dispatch({
      type: actions.UPDATE_GROUP,
      groupData: response.group,
      numberOfMembersNotConfirmedInCurrentCabin:
        numberOfMembersNotConfirmedInCurrentCabin + 1,
      remainingPurchasedTicketCount: response.remainingPurchasedTicketCount,
    });
    ref?.current?.focus();
    return { error: null };
  }

  const handleSubmit = canAssignPurchasedTicket
    ? handleCreatePurchasedGuest
    : handleAddGuestToGroup;

  return (
    <>
      <AddGuests
        cabin={cabin}
        handleSubmit={handleSubmit}
        canCreateNewUser={canAssignPurchasedTicket}
        remainingPurchasedTicketCount={remainingPurchasedTicketCount}
      />
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
