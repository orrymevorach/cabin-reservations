import { createGroup, updateGroup } from '@/lib/airtable';
import { useState, useRef } from 'react';
import styles from './inputVerify.module.scss';
import Button from '@/components/shared/button/button';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Input from '@/components/shared/input/input';
import clsx from 'clsx';

export const createOrUpdateGroup = async ({ users = [], groupData }) => {
  const hasExistingGroup = !!groupData?.id;
  const groupRecordIds = users.map(({ id }) => id);
  if (!hasExistingGroup) {
    const response = await createGroup({
      groupName: users[0].name,
      members: groupRecordIds,
    });
    return {
      id: response.id,
      members: users,
    };
  } else {
    const response = await updateGroup({
      groupId: groupData.id,
      members: groupRecordIds,
    });
    return {
      id: response.id,
      members: users,
    };
  }
};

export const verifyEmail = async ({ user, groupData }) => {
  const hasUser = user?.id;
  const groupEmails = groupData.members.map(({ emailAddress }) => emailAddress);
  const isRepeatEmail = groupEmails.includes(user.emailAddress);
  if (isRepeatEmail) {
    return {
      error: 'This guest is already in your group. Please enter a new email.',
    };
  } else if (!hasUser) {
    return {
      error: 'No user found with this email.',
    };
  } else if (user.cabin) {
    return {
      error: 'This guest is already in a cabin.',
    };
  }
  return { error: null };
};

export default function InputVerify({ handleSubmit, allowCreateNewUser }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const firstNameRef = useRef();
  const emailRef = useRef();

  const handleChange = ({ callback, value }) => {
    callback(value);
    setError('');
  };

  async function handleSubmitForm(e) {
    e.preventDefault();
    setIsLoading(true);
    const refToFocus = firstNameRef?.current ? firstNameRef : emailRef;
    const { error } = await handleSubmit({
      firstName,
      lastName,
      email,
      ref: refToFocus,
    });
    if (error) {
      setError(error);
      setIsLoading(false);
      return;
    }
    setFirstName('');
    setLastName('');
    setEmail('');
    setIsLoading(false);
  }

  return (
    <form onSubmit={e => handleSubmitForm(e)}>
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
              required
            />
            <Input
              handleChange={e =>
                handleChange({ callback: setLastName, value: e.target.value })
              }
              value={lastName}
              label="Last Name"
              required
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
          required
        />
        <Button isLoading={isLoading} classNames={styles.button}>
          Add Guest <FontAwesomeIcon icon={faPlus} size="sm" />
        </Button>
      </div>
    </form>
  );
}
