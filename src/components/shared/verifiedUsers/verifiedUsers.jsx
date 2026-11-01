import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './verifiedUsers.module.scss';
import { faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import { useUser } from '@/context/user-context';
import { useReservation } from '@/context/reservation-context';
import clsx from 'clsx';
import { removeGroupMember } from '@/lib/platform-api';
import { useState } from 'react';
import Loader from '../loader/loader';
import { logSentryError } from '@/utils/sentry-utils';

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
  const [removeError, setRemoveError] = useState('');

  const handleRemoveUser = async ({ currentUser }) => {
    setRemoveError('');
    setIsLoading(true);
    try {
      const memberRecordIds = groupData.members.map(({ id }) => id);

      const response = await removeGroupMember({
        groupId: groupData.id,
        memberIds: memberRecordIds,
        removeUserId: currentUser.id,
      });

      // Keep the current group list when the removal fails, so the page does not replace it with an empty group.
      if (!response?.group) {
        setRemoveError(
          response?.message || 'Unable to remove this guest. Please try again.',
        );
        return;
      }

      dispatch({
        type: actions.UPDATE_GROUP,
        groupData: response.group,
        numberOfMembersNotConfirmedInCurrentCabin:
          numberOfMembersNotConfirmedInCurrentCabin - 1,
      });
    } catch (error) {
      logSentryError(error, {
        action: 'remove-group-member',
        groupId: groupData?.id,
        removeUserId: currentUser?.id,
      });
      setRemoveError('Unable to remove this guest. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className={styles.verifiedUserContainer}>
      <p
        className={clsx(
          styles.verifiedUser,
          !isLoggedInUser && styles.nonActiveUser,
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
            <Loader isDotted size='lg' classNames={styles.loader} />
          )}
        </button>
      ) : (
        ''
      )}
      {removeError && (
        <p className={styles.removeError} role='alert'>
          {removeError}
        </p>
      )}
    </div>
  );
};

export default function VerifiedUsers({ hideRemoveButton, classNames }) {
  const { groupData } = useReservation();
  const { user } = useUser();

  const members = groupData?.members?.length ? groupData.members : [user];

  return (
    <div className={clsx(styles.container, classNames)}>
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
