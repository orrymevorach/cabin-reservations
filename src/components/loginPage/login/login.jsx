import { getUserByEmail } from '@/lib/airtable';
import { getAttendeeAndAssignFirebaseUid } from '@/lib/platform-api';
import { useState } from 'react';
import styles from './login.module.scss';
import Button from '../../shared/button/button';
import Input from '@/components/shared/input/input';
import Cookies from 'js-cookie';
import { COOKIES } from '@/utils/constants';
import { signInWithFirebaseEmailAndPassword } from './firebase-utils';
import { errors as firebaseErrors } from './firebase-utils';
import { isObjectEmpty } from '@/utils/string-utils';

export const errors = {
  USER_NOT_FOUND:
    'We do not have a record of this email. Please buy a ticket, or contact info@highlandsmusicfestival.ca',
  GENERIC:
    "We're sorry, an unknown error has occured. Please contact info@highlandsmusicfestival.ca.",
  PASSWORD_DOES_NOT_MATCH:
    'This password does not match the one that was sent to your email. Please check your email and try again.',
  SIGN_IN_FAILED:
    'We could not sign you in with that email and password. Are you a first time user? Select Create an account below. Do you already have an account? Select Forgot Password below.',
};

export default function Login({ handleSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);

    // Step 1: Try to log in with firebase
    const firebaseResponse = await signInWithFirebaseEmailAndPassword({
      email,
      password,
    });

    let user = null;
    try {
      if (firebaseResponse.user) {
        const idToken = await firebaseResponse.user.getIdToken();
        user = await getAttendeeAndAssignFirebaseUid({ idToken });
      } else {
        user = await getUserByEmail({ email });
      }
      const hasUser = !isObjectEmpty(user);
      // Firebase account exists but user does not have a ticket. This scenario occurs if someone purchased a ticket in a previous year, but has not purchased a ticket this year.
      if (!hasUser) {
        setError(errors.USER_NOT_FOUND);
        setIsLoading(false);
        return;
      }
    } catch (error) {
      // Firebase errors carry a code and a technical message, so map them to the login error copy.
      const errorMessage = error.code
        ? firebaseErrors[error.code]?.message || errors.GENERIC
        : error.message || errors.GENERIC;
      setError(errorMessage);
      setIsLoading(false);
      return;
    }

    const isFirebaseLoginSuccessful = Boolean(firebaseResponse.user?.uid);

    // Step 1a: If firebase login is successful, handle success
    if (isFirebaseLoginSuccessful) {
      Cookies.set(COOKIES.USER_RECORD, user.id, { expires: 7 });
      handleSuccess({ email, user });
    }
    // A new ticket can lack a UID for an existing account, so failed sign-ins must not redirect to account creation.
    else {
      const errorCode = firebaseResponse.error?.code;
      const isCredentialError = [
        'auth/invalid-credential',
        'auth/wrong-password',
        'auth/user-not-found',
      ].includes(errorCode);
      const errorMessage = isCredentialError
        ? errors.SIGN_IN_FAILED
        : firebaseErrors[errorCode]?.message || errors.GENERIC;
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleChangeEmail = e => {
    setError('');
    setEmail(e.target.value.toLowerCase());
  };

  const handleChangePassword = e => {
    setError('');
    setPassword(e.target.value);
  };

  return (
    <form
      action='#'
      onSubmit={e => handleSubmit(e)}
      className={styles.container}
    >
      <Input
        type='email'
        id='email'
        handleChange={e => handleChangeEmail(e)}
        classNames={styles.emailInput}
        label='Email'
        error={error}
        value={email}
      />
      <Input
        type='password'
        id='password'
        handleChange={e => handleChangePassword(e)}
        label='Password'
        value={password}
      />
      <Button isLoading={isLoading} classNames={styles.submit} isSmall>
        Log in
      </Button>
    </form>
  );
}
