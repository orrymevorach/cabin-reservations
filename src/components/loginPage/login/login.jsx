import { getAttendeeAndAssignFirebaseUid } from '@/lib/platform-api';
import { useState } from 'react';
import styles from './login.module.scss';
import Button from '../../shared/button/button';
import Input from '@/components/shared/input/input';
import {
  sendFirebaseEmailVerification,
  signInWithFirebaseEmailAndPassword,
} from './firebase-utils';
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

    // Step 1a: Firebase sign-in failed. Show the sign-in error without looking the email up, so the
    // form does not reveal which emails hold tickets.
    if (!firebaseResponse.user?.uid) {
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
      return;
    }

    // Step 2: Link the Firebase account to its ticket. The server checks the Firebase token and sets
    // the signed session cookie that identifies the user on every page.
    let user = null;
    try {
      const idToken = await firebaseResponse.user.getIdToken();
      user = await getAttendeeAndAssignFirebaseUid({ idToken });
    } catch (error) {
      // A returning user's new ticket links only after they verify their email, so send the
      // verification link and ask them to log in again once they have opened it.
      if (error.linkErrorCode === 'EMAIL_VERIFICATION_REQUIRED') {
        await sendFirebaseEmailVerification(firebaseResponse.user);
        setError(error.message);
        setIsLoading(false);
        return;
      }
      // Firebase errors carry a code and a technical message, so map them to the login error copy.
      const errorMessage = error.code
        ? firebaseErrors[error.code]?.message || errors.GENERIC
        : error.message || errors.GENERIC;
      setError(errorMessage);
      setIsLoading(false);
      return;
    }

    // Firebase account exists but user does not have a ticket. This scenario occurs if someone purchased a ticket in a previous year, but has not purchased a ticket this year.
    if (isObjectEmpty(user)) {
      setError(errors.USER_NOT_FOUND);
      setIsLoading(false);
      return;
    }
    handleSuccess({ email, user });
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
