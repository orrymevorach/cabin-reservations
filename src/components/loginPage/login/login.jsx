import { getUserByEmail } from '@/lib/airtable';
import { useState } from 'react';
import styles from './login.module.scss';
import Button from '../../shared/button/button';
import Input from '@/components/shared/input';
import Cookies from 'js-cookie';
import { COOKIES, ROUTES } from '@/utils/constants';
import { signInWithFirebaseEmailAndPassword } from './firebase-utils';
import { useRouter } from 'next/router';

const errors = {
  USER_NOT_FOUND:
    'We do not have a record of this email. Please buy a ticket, or contact info@highlandsmusicfestival.ca',
  GENERIC:
    "We're sorry, an unknown error has occured. Please contact info@highlandsmusicfestival.ca.",
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
    const res = await signInWithFirebaseEmailAndPassword({ email, password });

    if (res.error) {
      setIsLoading(false);
      const firebaseError = errors[res.error.code] || errors.GENERIC;
      setError(firebaseError);
      return;
    }

    let user = null;
    try {
      user = await getUserByEmail({ email });
    } catch (error) {
      console.error(error);
    }

    // Step 1a: If user has firebase account, log them in using firebase auth
    if (res.user?.uid) {
      Cookies.set(COOKIES.USER_RECORD, user.id);
      handleSuccess({ email, user });
    }
    // Step 1b: If user does not have a firebase account, check to see if they have a ticket
    else {
      const userHasTicket = user?.id;
      // Step 2a: If user has ticket, redirect them to create account page
      if (userHasTicket) {
        setIsLoading(false);
        router.push(ROUTES.CREATE_ACCOUNT);
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
