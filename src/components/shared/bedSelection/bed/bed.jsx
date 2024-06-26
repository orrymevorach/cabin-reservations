import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './bed.module.scss';
import {
  faMattressPillow,
  faMinusCircle,
} from '@fortawesome/free-solid-svg-icons';
import { useReservation } from '@/context/reservation-context';
import clsx from 'clsx';
import { useUser } from '@/context/user-context';
import BedDropdown from './bed-dropdown/bed-dropdown';
import { clearCurrentBedSelection, getUserByRecordId } from '@/lib/airtable';
import Loader from '../../loader/loader';

const filterOutUsersWithSelectedBeds = ({ members, selectedBeds }) => {
  return members
    .filter(({ id }) => {
      for (let i = 0; i < selectedBeds.length; i++) {
        const selectedBed = selectedBeds[i];
        const userHasBed = selectedBed.id === id;
        if (userHasBed) return false;
      }
      return true;
    })
    .map(({ name }) => name);
};

const getIsBedOccupiedByMemberOfGroup = ({ members, bedName, cabin }) => {
  return members.find(({ name }) => {
    if (cabin[bedName] && cabin[bedName].name === name) {
      return true;
    }
    return false;
  });
};

export default function Bed({
  bedName,
  classNames = '',
  flip = false,
  readOnly,
  cabin,
}) {
  const {
    selectedBeds,
    dispatch,
    actions,
    groupData: { members },
  } = useReservation();
  const { user, dispatch: dispatchUser, actions: userActions } = useUser();
  const [currentUser, setCurrentUser] = useState('');
  const [placeOnHold, setPlaceOnHold] = useState(false);
  const [isRemoveLoading, setIsRemoveLoading] = useState(false);

  // Filter out names with selected beds
  const usersWithoutSelectedBeds = filterOutUsersWithSelectedBeds({
    members,
    selectedBeds,
  });

  const handleChange = selectedUser => {
    const currentUserData = members.find(({ name }) => selectedUser === name);

    const { id, name, emailAddress } = currentUserData;

    selectedBeds.push({
      bedName,
      id,
      name,
      emailAddress,
    });
    dispatch({ type: actions.SELECT_BEDS, selectedBeds });
    setCurrentUser(name);
    setPlaceOnHold(true);
  };

  const currentBedOccupantInCurrentGroup = getIsBedOccupiedByMemberOfGroup({
    members,
    bedName,
    cabin,
  });

  // Set bed status on page load
  useEffect(() => {
    const isBedSelected = cabin[bedName];
    if (currentBedOccupantInCurrentGroup) {
      // If bed is selected by a person in this group
      setCurrentUser(currentBedOccupantInCurrentGroup.name);
    } else if (isBedSelected) {
      // If bed is selected by a person outside of this group
      setCurrentUser('Reserved');
    }
  }, [currentBedOccupantInCurrentGroup, cabin, bedName]);

  const handleRemove = async () => {
    setIsRemoveLoading(true);
    const currentUserData = members.find(({ name }) => currentUser === name);
    const updatedBeds = selectedBeds.filter(({ name }) => name !== currentUser);
    await clearCurrentBedSelection({ userId: currentUserData.id });
    // Getting user to have up to date cabin data
    const userData = await getUserByRecordId({ id: user.id });
    setCurrentUser();
    setPlaceOnHold(false);
    dispatchUser({ type: userActions.LOG_IN, userData });
    dispatch({
      type: actions.SELECT_BEDS,
      selectedBeds: updatedBeds,
    });
    setIsRemoveLoading(false);
  };

  const BedIcon = () => (
    <FontAwesomeIcon
      icon={faMattressPillow}
      size="3x"
      className={clsx(
        styles.icon,
        currentUser && styles.reserved,
        placeOnHold && styles.selected
      )}
    />
  );

  if (readOnly)
    return (
      <div className={clsx(styles.bed, classNames, flip && styles.flip)}>
        {flip && <BedIcon />}
        <p className={clsx(styles.reservedText, styles.anonymous)}>
          {currentUser === 'Reserved' ? currentUser : 'Available'}
        </p>

        {!flip && <BedIcon />}
      </div>
    );

  return (
    <div className={clsx(styles.bed, classNames, flip && styles.flip)}>
      {flip && <BedIcon />}
      {!currentUser ? (
        <BedDropdown
          options={usersWithoutSelectedBeds}
          classNames={styles.dropdown}
          handleChange={handleChange}
          label="Select Guest"
          value={currentUser}
        />
      ) : currentUser && !isRemoveLoading ? (
        <p
          className={clsx(
            styles.reservedText,
            currentUser === 'Reserved' && styles.anonymous
          )}
        >
          {currentUser !== 'Reserved' && (
            <button onClick={handleRemove} className={styles.removeButton}>
              <FontAwesomeIcon icon={faMinusCircle} />
            </button>
          )}
          {currentUser}
        </p>
      ) : (
        isRemoveLoading && (
          <Loader isDotted classNames={styles.removeBedLoader} size="lg" />
        )
      )}

      {!flip && <BedIcon />}
    </div>
  );
}
