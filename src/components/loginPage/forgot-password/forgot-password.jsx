import { useState } from 'react';
import ForgotPasswordTakeover from './forgot-password-takeover/forgot-password-takeover';
import styles from './forgot-password.module.scss';

export default function ForgotPassword() {
  const [showForgotPasswordTakeover, setShowForgotPasswordTakeover] =
    useState(false);
  return (
    <>
      {showForgotPasswordTakeover && (
        <ForgotPasswordTakeover
          handleClose={() => setShowForgotPasswordTakeover(false)}
        />
      )}
      <p className={styles.forgotPassword}>
        Forgot your password?{' '}
        <button
          className={styles.button}
          onClick={() => setShowForgotPasswordTakeover(true)}
        >
          Click here
        </button>{' '}
        to reset it.
      </p>
    </>
  );
}
