import styles from './forgot-password-takeover.module.scss';
import Button from '@/components/shared/button/button';
import Input from '@/components/shared/input/input';
import Takeover from '@/components/shared/takeover/takeover';
import { sendFirebasePasswordResetEmail } from '@/components/loginPage/login/firebase-utils';
import { useState } from 'react';

export default function ForgotPasswordTakeover({ handleClose }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const handleSubmit = async e => {
    setIsLoading(true);
    e.preventDefault();
    await sendFirebasePasswordResetEmail({ email });
    setIsLoading(false);
    setShowSuccess(true);
  };
  return (
    <Takeover handleClose={handleClose} modalClassNames={styles.modal}>
      {showSuccess ? (
        <>
          <h2 className={styles.header}>
            If an account is associated with that email, a password reset link
            has been sent.
          </h2>
          <p className={styles.text}>
            If you do not receive a password reset link in your inbox, check
            your junk mail. If the email is not in your inbox, try creating an
            account. If you are having issues, please reach out to
            info@highlandsmusicfestival.ca.
          </p>
          <p className={styles.text}>
            If you do not receive a password reset link in your inbox, check
            your junk mail. If you still do not see it, please reach out to
            info@highlandsmusicfestival.ca.
          </p>
          <Button handleClick={handleClose} classNames={styles.button}>
            Close
          </Button>
        </>
      ) : (
        <>
          <h2 className={styles.header}>
            Please enter your email to send a password reset link
          </h2>
          <form action="#" onSubmit={handleSubmit}>
            <Input handleChange={e => setEmail(e.target.value)} />
            <Button classNames={styles.button} isLoading={isLoading}>
              Send Password Reset Link
            </Button>
          </form>
        </>
      )}
    </Takeover>
  );
}
