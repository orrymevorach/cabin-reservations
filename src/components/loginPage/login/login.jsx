import { getUserByEmail } from '@/lib/airtable';
import { useEffect, useState } from 'react';
import styles from './login.module.scss';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import { COOKIES, ROUTES } from '@/utils/constants';
import Button from '../../shared/button/button';
import Input from '@/components/shared/input';

const useLoginExistingUserOnPageLoad = () => {
  const router = useRouter();
  useEffect(() => {
    const userRecordCookie = Cookies.get(COOKIES.USER_RECORD);
    if (userRecordCookie) {
      router.push({
        pathname: ROUTES.CABIN_SELECTION,
      });
    }
  }, [router]);
};

const errors = {
  USER_NOT_FOUND:
    'We do not have a record of this email. Please buy a ticket, or contact info@highlandsmusicfestival.ca',
  INCORRECT_PASSWORD:
    'The order confirmation number does not match the one we have on file for this email. Please double check your spelling, or contact info@highlandsmusicfestival.ca',
  GENERIC:
    "We're sorry, an unknown error has occured. Please contact info@highlandsmusicfestival.ca.",
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  useLoginExistingUserOnPageLoad();

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
      const hasCabin = user.cabin && user.cabin[0];
      if (hasCabin) router.push(ROUTES.SUMMARY);
      else router.push(ROUTES.CABIN_SELECTION);
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

  const handleChange = (e, setInput) => {
    setError('');
    setInput(e.target.value);
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
        handleChange={e => handleChange(e, setEmail)}
        classNames={styles.emailInput}
        label="Email"
        error={error}
      />
      <Input
        type="password"
        id="password"
        handleChange={e => handleChange(e, setPassword)}
        label="Order confirmation number"
      />
      <Button isLoading={isLoading} classNames={styles.submit}>
        Log in
      </Button>
    </form>
  );
}
