import { getUserByEmail } from '@/lib/airtable';
import { useEffect, useState } from 'react';
import styles from './loginPage.module.scss';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import Loader from '../shared/loader/loader';
import { COOKIES, ROUTES } from '@/utils/constants';

const useLoginExistingUserOnPageLoad = () => {
  const router = useRouter();
  useEffect(() => {
    const userRecordCookie = Cookies.get(COOKIES.USER_RECORD);
    if (userRecordCookie) {
      router.push({
        pathname: ROUTES.RESERVE,
        query: {
          id: userRecordCookie,
        },
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
      setIsLoading(false);
      Cookies.set(COOKIES.USER_RECORD, user.id);
      router.push({
        pathname: ROUTES.RESERVE,
        query: {
          id: user.id,
        },
      });
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

  if (isLoading) return <Loader />;

  return (
    <form action="#" onSubmit={e => handleSubmit(e)} className={styles.login}>
      <label htmlFor="email">Please enter your email</label>
      {error && <p className={styles.error}>{error}</p>}
      <input
        type="email"
        id="email"
        name="email"
        onChange={e => handleChange(e, setEmail)}
        value={email}
      />
      <label htmlFor="password">
        Please enter your order confirmation number
      </label>
      <input
        type="password"
        id="password"
        name="password"
        onChange={e => handleChange(e, setPassword)}
      />
      <input type="submit" />
    </form>
  );
}
