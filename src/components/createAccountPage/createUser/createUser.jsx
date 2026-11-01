import Input from '@/components/shared/input/input';
import styles from './createUser.module.scss';
import { useEffect, useState } from 'react';
import Button from '@/components/shared/button/button';
import { useRouter } from 'next/router';
import { getUserByEmail } from '@/lib/airtable';
import UpdatePasswordTakeover from '../updatePasswordTakeover/updatePasswordTakeover';
import { errors } from '@/components/loginPage/login/login';
import { sendTemporaryPasswordEmail } from '@/lib/emails';
import clsx from 'clsx';
import Loader from '@/components/shared/loader/loader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { logSentryError } from '@/utils/sentry-utils';
import { ticketLookupErrorMessage } from '@/utils/api-error-utils';

export default function CreateUser() {
  const [emailInput, setEmailInput] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [showTakeover, setShowTakeover] = useState(false);
  const [user, setUser] = useState(null);
  const [isPasswordSending, setIsPasswordSending] = useState(false);
  const [isPasswordSentSuccess, setIsPasswordSentSuccess] = useState(false);

  useEffect(() => {
    if (router.query.email) {
      const email = router.query.email;
      setEmailInput(email);
    }
  }, [router]);

  const handleChangePassword = e => {
    setPassword(e.target.value);
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userData = await getUserByEmail({ email: emailInput });
      if (!userData.id) {
        setError(errors.USER_NOT_FOUND);
        return;
      } else if (password !== userData.temporaryPassword) {
        setError(errors.PASSWORD_DOES_NOT_MATCH);
        return;
      }
      setUser(userData);
      setShowTakeover(true);
    } catch (error) {
      logSentryError(error, { action: 'verify-temporary-password' });
      setError(ticketLookupErrorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTemporaryPassword = async () => {
    if (!emailInput) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setIsPasswordSending(true);
    try {
      const response = await sendTemporaryPasswordEmail({
        emailAddress: emailInput,
      });
      // Only show "Sent!" when the email endpoint confirms the send, so a failed send prompts the guest to retry.
      if (!response?.success) {
        throw new Error(response?.error || 'Temporary password email failed');
      }
      setIsPasswordSentSuccess(true);
    } catch (error) {
      logSentryError(error, { action: 'resend-temporary-password' });
      setError(
        'We could not send your temporary password. Please try again, or contact info@highlandsmusicfestival.ca if the problem continues.',
      );
    } finally {
      setIsPasswordSending(false);
    }
  };

  return (
    <>
      {showTakeover ? (
        <UpdatePasswordTakeover
          handleClose={() => setShowTakeover(false)}
          user={user}
        />
      ) : (
        <form action='#' className={styles.form} onSubmit={handleSubmit}>
          <p className={styles.heading}>Create An Account</p>
          {error && <p className={styles.error}>{error}</p>}
          <Input
            type='email'
            id='set-email'
            label='Email Address'
            handleChange={e => setEmailInput(e.target.value)}
            value={emailInput}
            labelClassNames={styles.label}
            classNames={styles.inputContainer}
            required
          />
          <div>
            <Input
              type='password'
              id='set-password'
              label='Temporary Password'
              asterisk='(The one sent to your email)'
              handleChange={handleChangePassword}
              value={password}
              labelClassNames={styles.label}
              classNames={clsx(styles.inputContainer, styles.passwordInput)}
              required
            />
            <button
              onClick={handleSendTemporaryPassword}
              type='button'
              className={styles.resendButton}
            >
              {!isPasswordSentSuccess && <span>Resend Temporary Password</span>}
              {isPasswordSending && (
                <Loader isDotted classNames={styles.loader} />
              )}
              {!isPasswordSending && isPasswordSentSuccess && (
                <>
                  <span>Sent!</span>
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className={styles.checkmark}
                  />
                </>
              )}
            </button>
          </div>

          <Button isLoading={isLoading} classNames={styles.button} isSecondary>
            Submit
          </Button>
        </form>
      )}
    </>
  );
}
