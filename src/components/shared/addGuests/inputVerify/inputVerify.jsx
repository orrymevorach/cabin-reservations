import {
  createGroup,
  createUser,
  getCabinById,
  getUserByEmail,
  reserveSpotInCabin,
  updateGroup,
} from '@/lib/airtable';
import { useState, useRef } from 'react';
import styles from './inputVerify.module.scss';
import Button from '@/components/shared/button/button';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Input from '@/components/shared/input/input';
import { useReservation } from '@/context/reservation-context';
import { useUser } from '@/context/user-context';
import clsx from 'clsx';
import { sendConfirmationEmail } from '@/lib/mailgun';

const createOrUpdateGroup = async ({ user, groupData }) => {
  const hasExistingGroup = !!groupData?.id;
  const groupRecordIds = groupData.members.map(({ id }) => id);
  if (!hasExistingGroup) {
    const response = await createGroup({
      groupName: user.name,
      members: groupRecordIds,
    });
    return {
      id: response.id,
      members: groupData.members,
    };
  } else {
    const response = await updateGroup({
      groupId: groupData.id,
      members: groupRecordIds,
    });
    return {
      id: response.id,
      members: groupData.members,
    };
  }
};

export default function InputVerify({ allowCreateNewUser }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const {
    groupData,
    dispatch,
    actions,
    numberOfMembersNotConfirmedInCurrentCabin,
  } = useReservation();
  const { user } = useUser();
  const firstNameRef = useRef();
  const emailRef = useRef();

  const handleChange = ({ callback, value }) => {
    callback(value);
    setError('');
  };

  const verifyEmail = async () => {
    setIsLoading(true);
    const userResponse = await getUserByEmail({ email });
    const hasUser = userResponse && userResponse.id;
    const groupEmails = groupData.members.map(
      ({ emailAddress }) => emailAddress
    );
    const isRepeatEmail = groupEmails.includes(email);
    if (isRepeatEmail) {
      return {
        error: 'This guest is already in your group. Please enter a new email.',
      };
    } else if (!hasUser) {
      return {
        error: 'No user found with this email.',
      };
    } else if (userResponse.cabin) {
      return {
        error: 'This guest is already in a cabin.',
      };
    }
    return { userResponse };
  };

  const handleAddExistingGuest = async ({ newUser, event }) => {
    event.preventDefault();

    // Initiate user to add variable. If a user was just created, this will be the newUser
    let userToAddToGroup = newUser;

    // If no new newUser, verify that the user being added already has a ticket, and reset the userToAddToGroup variable
    if (!newUser) {
      const { userResponse, error } = await verifyEmail();
      if (error) {
        setError(error);
        setIsLoading(false);
        setEmail('');
        return;
      }
      userToAddToGroup = userResponse;
    }

    // Using member data, create group or update existing group
    // If a group doesn't exist, include the user who is adding new users to the group, otherwise leave them out because they are already in the members array
    const groupDataWithNewMembers = {
      ...groupData,
      members: groupData?.members?.length
        ? [...groupData.members, userToAddToGroup]
        : [...groupData.members, user, userToAddToGroup],
    };
    const updatedGroupData = await createOrUpdateGroup({
      user,
      groupData: groupDataWithNewMembers,
    });

    await reserveSpotInCabin({
      cabinId: user.cabin.id,
      attendeeId: userToAddToGroup.id,
    });
    await sendConfirmationEmail({
      groupMember: userToAddToGroup,
      cabin: user.cabin.id,
      host: user,
    });

    const cabin = await getCabinById({ cabinId: user.cabin.id });

    setIsLoading(false);
    setEmail('');
    setFirstName('');
    setLastName('');
    dispatch({
      type: actions.UPDATE_GROUP,
      groupData: updatedGroupData,
      numberOfMembersNotConfirmedInCurrentCabin:
        numberOfMembersNotConfirmedInCurrentCabin + 1,
      cabin,
    });
    // If creating new user, focus on first name ref, otherwise focus on email ref
    firstNameRef?.current
      ? firstNameRef.current.focus()
      : emailRef.current.focus();
  };

  const handleCreateGuest = async ({ event }) => {
    event.preventDefault();
    setIsLoading(true);
    // Check that user does not already exist
    const userResponse = await getUserByEmail({ email });
    const hasUser = userResponse && userResponse.id;
    if (hasUser) {
      setError(
        'We already have a ticket associated with this email. Please enter a new email.'
      );
      setIsLoading(false);
      return;
    }
    const newUser = await createUser({
      name: `${firstName} ${lastName}`,
      email,
    });
    await handleAddExistingGuest({ newUser, event });
  };

  const handleSubmit = allowCreateNewUser
    ? handleCreateGuest
    : handleAddExistingGuest;

  return (
    <form onSubmit={e => handleSubmit({ event: e })}>
      <div className={clsx(!allowCreateNewUser && styles.row)}>
        {allowCreateNewUser && (
          <>
            <Input
              handleChange={e =>
                handleChange({
                  callback: setFirstName,
                  value: e.target.value,
                })
              }
              value={firstName}
              label="First Name"
              inputRef={firstNameRef}
            />
            <Input
              handleChange={e =>
                handleChange({ callback: setLastName, value: e.target.value })
              }
              value={lastName}
              label="Last Name"
            />
          </>
        )}
        <Input
          handleChange={e =>
            handleChange({
              callback: setEmail,
              value: e.target.value.toLowerCase(),
            })
          }
          value={email}
          label="Email address"
          error={error}
          inputRef={emailRef}
        />
        <Button isLoading={isLoading} classNames={styles.button}>
          Add Guest <FontAwesomeIcon icon={faPlus} size="sm" />
        </Button>
      </div>
    </form>
  );
}
