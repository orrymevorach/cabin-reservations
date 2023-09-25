import { getUserByEmail } from '@/lib/airtable';
import { useState } from 'react';
import styles from './login.module.scss';
import Button from '../../shared/button/button';
import Input from '@/components/shared/input';
import Cookies from 'js-cookie';
import { COOKIES } from '@/utils/constants';

const errors = {
  USER_NOT_FOUND:
    'We do not have a record of this email. Please buy a ticket, or contact info@highlandsmusicfestival.ca',
  INCORRECT_PASSWORD:
    'This password does not match the one we have on file for this email. Please double check your spelling, or contact info@highlandsmusicfestival.ca',
  GENERIC:
    "We're sorry, an unknown error has occured. Please contact info@highlandsmusicfestival.ca.",
};

export default function Login({ handleSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    const user = await getUserByEmail({ email });

    const userNotFound = !user?.id;
    const passwordDoesNotMatch = user?.id && user?.paymentIntent !== password;
    const userExistsAndPasswordMatches =
      user?.id && user?.paymentIntent === password;
    if (userExistsAndPasswordMatches) {
      Cookies.set(COOKIES.USER_RECORD, user.id);
      setIsLoading(false);
      handleSuccess({ user });
      return;
    } else if (passwordDoesNotMatch) {
      setIsLoading(false);
      setError(errors.INCORRECT_PASSWORD);
      return;
    } else if (userNotFound) {
      setError(errors.USER_NOT_FOUND);
      setIsLoading(false);
      return;
    } else {
      setIsLoading(false);
      setError(errors.GENERIC);
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
