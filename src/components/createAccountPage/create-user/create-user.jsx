import Input from '@/components/shared/input/input';
import styles from './create-user.module.scss';
import { useState } from 'react';
import Button from '@/components/shared/button/button';
import {
  createFirebaseUser,
  errors,
} from '../../loginPage/login/firebase-utils';
import { useRouter } from 'next/router';
import { COOKIES, ROUTES } from '@/utils/constants';
import Cookies from 'js-cookie';
import { getUserByEmail } from '@/lib/airtable';

export default function CreateUser() {
  const [emailInput, setEmailInput] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChangePassword = e => {
    setPassword(e.target.value);
    setError('');
  };

  const handleChangeConfirmPassword = e => {
    setConfirmPassword(e.target.value);
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);

    // Check that passwords match
    if (password !== confirmPassword) {
      setIsLoading(false);
      setError(errors.PASSWORDS_DO_NOT_MATCH);
      return;
    }

    try {
      const response = await createFirebaseUser({
        email: emailInput,
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

      const user = await getUserByEmail({ email: emailInput });
      Cookies.set(COOKIES.USER_RECORD, user.id);
      setIsLoading(false);
      router.push(ROUTES.CABIN_SELECTION);
    } catch (error) {
      setError(error);
    }
  };
  return (
    <form action="#" className={styles.form} onSubmit={handleSubmit}>
      <p className={styles.heading}>Create An Account</p>
      {error && <p className={styles.error}>{error}</p>}
      <Input
        type="email"
        id="set-email"
        label="Email Address"
        handleChange={e => setEmailInput(e.target.value)}
        value={emailInput}
        labelClassNames={styles.label}
        classNames={styles.inputContainer}
        required
      />
      <Input
        type="password"
        id="set-password"
        label="Password"
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
  );
}
