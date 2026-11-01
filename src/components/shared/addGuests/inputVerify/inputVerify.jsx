import { useState, useRef } from 'react';
import styles from './inputVerify.module.scss';
import Button from '@/components/shared/button/button';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Input from '@/components/shared/input/input';
import clsx from 'clsx';
import { logSentryError } from '@/utils/sentry-utils';
import { unexpectedErrorMessage } from '@/utils/api-error-utils';

export default function InputVerify({ handleSubmit, canCreateNewUser }) {
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
    try {
      const { error } = await handleSubmit({
        firstName,
        lastName,
        email,
        ref: refToFocus,
      });
      if (error) {
        setError(error);
        return;
      }
      setFirstName('');
      setLastName('');
      setEmail('');
    } catch (error) {
      // Keep the typed guest details so the host can retry after a failed ticket lookup or request.
      logSentryError(error, { action: 'add-guest-to-group' });
      setError(unexpectedErrorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={e => handleSubmitForm(e)}>
      <div className={clsx(!canCreateNewUser && styles.row)}>
        {canCreateNewUser && (
          <>
            <Input
              handleChange={e =>
                handleChange({
                  callback: setFirstName,
                  value: e.target.value,
                })
              }
              value={firstName}
              label='First Name'
              inputRef={firstNameRef}
              required
            />
            <Input
              handleChange={e =>
                handleChange({ callback: setLastName, value: e.target.value })
              }
              value={lastName}
              label='Last Name'
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
          label='Email address'
          error={error}
          inputRef={emailRef}
          required
        />
        <Button isLoading={isLoading} classNames={styles.button}>
          Add Guest <FontAwesomeIcon icon={faPlus} size='sm' />
        </Button>
      </div>
    </form>
  );
}
