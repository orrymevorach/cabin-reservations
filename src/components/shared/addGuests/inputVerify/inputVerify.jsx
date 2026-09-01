import { useState, useRef } from 'react';
import styles from './inputVerify.module.scss';
import Button from '@/components/shared/button/button';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Input from '@/components/shared/input/input';
import clsx from 'clsx';

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
