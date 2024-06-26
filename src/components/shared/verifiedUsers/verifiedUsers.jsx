import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './verifiedUsers.module.scss';
import { faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import { useUser } from '@/context/user-context';
import { useReservation } from '@/context/reservation-context';
import clsx from 'clsx';
import { updateGroup } from '@/lib/airtable';
import { useState } from 'react';
import Loader from '../loader/loader';

const VerifiedUser = ({ currentUser, index, hideRemoveButton }) => {
  const {
    dispatch,
    actions,
    groupData,
    numberOfMembersNotConfirmedInCurrentCabin,
  } = useReservation();
  const { user } = useUser();
  const isLoggedInUser = currentUser.name === user.name;
  const [isLoading, setIsLoading] = useState(false);

  const handleRemoveUser = async ({ currentUser }) => {
    setIsLoading(true);
    const remainingMembers = groupData.members.filter(
      ({ id }) => id !== currentUser.id
    );
    const memberRecordIds = remainingMembers.map(({ id }) => id);

    await updateGroup({ groupId: groupData.id, members: memberRecordIds });
    groupData.members = remainingMembers;
    dispatch({
      type: actions.UPDATE_GROUP,
      groupData,
      numberOfMembersNotConfirmedInCurrentCabin:
        numberOfMembersNotConfirmedInCurrentCabin - 1,
    });
    setIsLoading(false);
  };
  return (
    <div className={styles.verifiedUserContainer}>
      <p
        className={clsx(
          styles.verifiedUser,
          !isLoggedInUser && styles.nonActiveUser
        )}
      >
        <span className={styles.number}>{index + 1}.</span>
        {currentUser.name}
      </p>
      {!isLoggedInUser && !hideRemoveButton ? (
        <button
          className={styles.remove}
          onClick={() => handleRemoveUser({ currentUser })}
        >
          {!isLoading ? (
            <FontAwesomeIcon icon={faMinusCircle} />
          ) : (
            <Loader isDotted size="lg" classNames={styles.loader} />
          )}
        </button>
      ) : (
        ''
      )}
    </div>
  );
};

export default function VerifiedUsers({ hideRemoveButton }) {
  const { groupData } = useReservation();
  const { user } = useUser();

  const members = groupData?.members || [];

  return (
    <div className={styles.container}>
      <p className={styles.title}>Names on Reservation</p>
      {members
        // add current user to top of list
        .sort((a, b) => {
          if (a.name === user.name) {
            return -1;
          }
          return 1;
        })
        .map((currentUser, index) => (
          <VerifiedUser
            key={currentUser.name}
            currentUser={currentUser}
            index={index}
            hideRemoveButton={hideRemoveButton}
          />
        ))}
    </div>
  );
}
