import Input from '@/components/shared/input/input';
import styles from '../createUser/createUser.module.scss';
import { useState } from 'react';
import Button from '@/components/shared/button/button';
import { useRouter } from 'next/router';
import { AIRTABLE_BASES, COOKIES, ROUTES } from '@/utils/constants';
import Cookies from 'js-cookie';
import Takeover from '@/components/shared/takeover/takeover';
import { errors as loginErrors } from '@/components/loginPage/login/login';
import {
  createFirebaseUser,
  errors,
} from '@/components/loginPage/login/firebase-utils';
import { updateRecord } from '@/lib/airtable';

export default function UpdatePasswordTakeover({ user, handleClose }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChangePassword = e => {
    setPassword(e.target.value);
    setError('');
  };

  const handleChangeConfirmPassword = e => {
    setConfirmPassword(e.target.value);
    setError('');
  };

  const handleCreateUser = async e => {
    e.preventDefault();
    setIsLoading(true);

    // Check that passwords match
    if (password !== confirmPassword) {
      setIsLoading(false);
      setError(loginErrors.PASSWORD_DOES_NOT_MATCH);
      return;
    }

    try {
      const response = await createFirebaseUser({
        email: user.emailAddress,
        password,
      });

      if (response.error) {
        const errorCode = response.error.code;
        const errorMessage =
          errors[errorCode]?.message || errors.GENERIC.message;
        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      await updateRecord({
        tableId: AIRTABLE_BASES.TICKET_PURCHASES,
        recordId: user.id,
        newFields: {
          'Firebase UID': response.user.uid,
        },
      });
      Cookies.set(COOKIES.USER_RECORD, user.id);
      setIsLoading(false);
      router.push(ROUTES.CABIN_SELECTION);
    } catch (error) {
      const errorMessage =
        errors[error.error]?.message || errors.GENERIC.message;
      setError(errorMessage);
    }
  };
  return (
    <Takeover handleClose={handleClose}>
      <form
        action="#"
        onSubmit={handleCreateUser}
        className={styles.form}
        style={{ marginTop: '0' }}
      >
        <p className={styles.heading}>Please update your password</p>
        {error && <p className={styles.error}>{error}</p>}

        <Input
          type="password"
          id="password"
          label="New Password"
          handleChange={handleChangePassword}
          value={password}
          labelClassNames={styles.label}
          classNames={styles.inputContainer}
          required
        />
        <Input
          type="password"
          id="confirm-password"
          label="Confirm Password"
          handleChange={handleChangeConfirmPassword}
          value={confirmPassword}
          labelClassNames={styles.label}
          classNames={styles.inputContainer}
          required
        />
        <Button isLoading={isLoading} classNames={styles.button} isSecondary>
          Submit
        </Button>
      </form>
    </Takeover>
  );
}
