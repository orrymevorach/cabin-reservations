import Input from '@/components/shared/input/input';
import styles from '../createUser/createUser.module.scss';
import { useState } from 'react';
import Button from '@/components/shared/button/button';
import { useRouter } from 'next/router';
import { ROUTES } from '@/utils/constants';
import Takeover from '@/components/shared/takeover/takeover';
import { errors as loginErrors } from '@/components/loginPage/login/login';
import {
  createFirebaseUser,
  errors,
} from '@/components/loginPage/login/firebase-utils';
import { getAttendeeAndAssignFirebaseUid } from '@/lib/platform-api';
import { logSentryError } from '@/utils/sentry-utils';

export default function UpdatePasswordTakeover({
  user,
  temporaryPassword,
  handleClose,
}) {
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

      // Link the new account to the ticket on the server, proving ownership with the temporary
      // password from the ticket email. The server also sets the signed session cookie.
      const idToken = await response.user.getIdToken();
      await getAttendeeAndAssignFirebaseUid({ idToken, temporaryPassword });
      setIsLoading(false);
      const destination = router.query.returnTo === ROUTES.DIETARY_INTAKE
        ? ROUTES.DIETARY_INTAKE
        : ROUTES.CABIN_SELECTION;
      router.push(destination);
    } catch (error) {
      logSentryError(error, { action: 'create-firebase-account' });
      const errorMessage =
        errors[error.error]?.message || errors.GENERIC.message;
      setError(errorMessage);
      setIsLoading(false);
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
