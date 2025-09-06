import styles from './bedSelection.module.scss';
import { useReservation } from '@/context/reservation-context';
import Button from '@/components/shared/button/button';
import { useState } from 'react';
import Cabin from './cabin/cabin';
import { clearCurrentBedSelection, reserveBed } from '@/lib/airtable';
import Legend from './legend/legend';
import { useWindowSize } from '@/context/window-size-context';
import { sendConfirmationEmail } from '@/lib/mailgun';
import { BEDS } from '@/utils/constants';
import { useUser } from '@/context/user-context';

const HeadStaffCabinInformation = () => {
  return (
    <div>
      <p>
        Bed selection for head staff cabins is not available. Each head staff
        cabin has three single beds per room. If you have any questions please
        contact info@highlandsmusicfestival.ca.
      </p>
    </div>
  );
};

export default function BedSelection({ readOnly = false, cabin }) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const {
    selectedBeds,
    groupData: { members },
  } = useReservation();
  const { isMobile } = useWindowSize();

  if (cabin.totalBeds === 3) return <HeadStaffCabinInformation />;

  const handleClick = async () => {
    setIsLoading(true);
    // selectedBeds contains all the reserved beds in the cabins, even those for people that are in a different group.
    // We don't want to make any updates to users that are not in the current group.
    const usersToBeUpdated = selectedBeds.filter(user => {
      for (let i = 0; i < members.length; i++) {
        const member = members[i];
        if (member.name === user.name) return true;
      }
    });
    for (let i = 0; i < usersToBeUpdated.length; i++) {
      const userToBeUpdated = usersToBeUpdated[i];
      const { bedName, id } = userToBeUpdated;
      const bedField = BEDS[bedName];
      await clearCurrentBedSelection({ userId: id });

      const response = await reserveBed({
        userId: id,
        bedName: bedField,
        cabinId: cabin.id || cabin[0], // After a bed is selected and then removed, the cabin data is removed and we only get the record id inside of the array
      });
      await sendConfirmationEmail({
        groupMember: userToBeUpdated,
        cabin,
        selectedBeds,
        host: user,
      });
    }
    setIsLoading(false);
    window.location = '/summary?stage=CONFIRMATION';
  };

  const ConfirmButton = () => {
    const { isMobile } = useWindowSize();
    return (
      <Button
        handleClick={handleClick}
        isLoading={isLoading}
        classNames={styles.button}
        isGold={isMobile}
      >
        Confirm Selection
      </Button>
    );
  };

  return (
    <div>
      {readOnly && (
        <p className={styles.readOnlyText}>
          You must reserve your spot in a cabin before you can reserve a bed.
        </p>
      )}
      <div className={styles.bedSelectionContainer}>
        <Cabin readOnly={readOnly} cabin={cabin} />
        <div className={styles.sidePanel}>
          {!isMobile && !readOnly ? <ConfirmButton /> : ''}
          <Legend readOnly={readOnly} />
        </div>
        {isMobile && !readOnly ? (
          <div className={styles.buttonContainer}>
            <ConfirmButton />
          </div>
        ) : (
          ''
        )}
      </div>
    </div>
  );
}
