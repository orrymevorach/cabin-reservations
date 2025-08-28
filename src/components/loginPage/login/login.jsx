import { addFirebaseUid, getUserByEmail } from '@/lib/airtable';
import { useState } from 'react';
import styles from './login.module.scss';
import Button from '../../shared/button/button';
import Input from '@/components/shared/input/input';
import Cookies from 'js-cookie';
import { COOKIES, ROUTES } from '@/utils/constants';
import { signInWithFirebaseEmailAndPassword } from './firebase-utils';
import { useRouter } from 'next/router';
import { errors as firebaseErrors } from './firebase-utils';
import { isObjectEmpty } from '@/utils/string-utils';

export const errors = {
  USER_NOT_FOUND:
    'We do not have a record of this email. Please buy a ticket, or contact info@highlandsmusicfestival.ca',
  GENERIC:
    "We're sorry, an unknown error has occured. Please contact info@highlandsmusicfestival.ca.",
  PASSWORD_DOES_NOT_MATCH:
    'This password does not match the one that was sent to your email. Please check your email and try again.',
};

export default function Login({ handleSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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
      user = await getUserByEmail({ email });
      const hasUser = !isObjectEmpty(user);
      // Firebase account exists but user does not have a ticket. This scenario occurs if someone purchased a ticket in a previous year, but has not purchased a ticket this year.
      if (!hasUser) {
        setError(errors.USER_NOT_FOUND);
        setIsLoading(false);
        return;
      }
      // Firebase account exists and user has a ticket, but no firebase UID. This scenario occurs for people who purchased tickets at the festival, or were added by people who purchased tickets at the festival.
      if (!user.firebaseUID) {
        await addFirebaseUid({
          attendeeId: user.id,
          uid: firebaseResponse.user.uid,
        });
      }
    } catch (error) {
      console.error(error);
    }

    const isFirebaseLoginSuccessful = firebaseResponse.user?.uid;
    const hasFirebaseAccount = firebaseResponse.user?.uid || user?.firebaseUID;

    // Step 1a: If firebase login is successful, handle success
    if (isFirebaseLoginSuccessful) {
      Cookies.set(COOKIES.USER_RECORD, user.id, { expires: 7 });
      handleSuccess({ email, user });
    }
    // Step 1ab: If login attempt was unsuccessful but user has firebase account, show error (likely incorrect password)
    else if (
      !isFirebaseLoginSuccessful &&
      firebaseResponse.error &&
      hasFirebaseAccount
    ) {
      setIsLoading(false);
      const firebaseError =
        firebaseErrors[firebaseResponse.error.code]?.message || errors.GENERIC;
      setError(firebaseError);
      return;
    }
    // Step 1c: If user does not have a firebase account, check to see if they have a ticket
    else {
      const userHasTicket = user?.id;
      // Step 2a: If user has ticket, redirect them to create account page
      if (userHasTicket) {
        setIsLoading(false);
        router.push({
          pathname: ROUTES.CREATE_ACCOUNT,
          query: { email },
        });
        return;
      }
      // Step 2b: If user does not have a ticket, show error message that they should buy a ticket
      else {
        setError(errors.USER_NOT_FOUND);
        setIsLoading(false);
        return;
      }
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
      action="#"
      onSubmit={e => handleSubmit(e)}
      className={styles.container}
    >
      <Input
        type="email"
        id="email"
        handleChange={e => handleChangeEmail(e)}
        classNames={styles.emailInput}
        label="Email"
        error={error}
        value={email}
      />
      <Input
        type="password"
        id="password"
        handleChange={e => handleChangePassword(e)}
        label="Password"
        value={password}
      />
      <Button isLoading={isLoading} classNames={styles.submit}>
        Log in
      </Button>
    </form>
  );
}
