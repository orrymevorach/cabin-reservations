import Takeover from '@/components/shared/takeover/takeover';
import useLogInAgain from '@/hooks/useLogInAgain';
import { ROUTES } from '@/utils/constants';
import styles from './errorPageTakeover.module.scss';

export default function ErrorPageTakeover({ statusCode }) {
  const { isLoggingInAgain, handleLogInAgain } = useLogInAgain();
  const isPageNotFound = statusCode === 404;

  return (
    <Takeover modalClassNames={styles.modal} hideCloseButton>
      <p className={styles.title}>
        {isPageNotFound
          ? "We couldn't find that page."
          : 'Oh No! There was an unexpected error.'}
      </p>
      <p className={styles.instruction}>Please try the following:</p>
      <ol className={styles.list}>
        {!isPageNotFound && (
          <li className={styles.listItem}>
            <button
              type='button'
              className={styles.linkButton}
              onClick={() => window.location.reload()}
            >
              Reload this page
            </button>
          </li>
        )}
        <li className={styles.listItem}>
          <a
            href={ROUTES.HOME}
            className={styles.link}
            onClick={handleLogInAgain}
            aria-disabled={isLoggingInAgain}
          >
            {isLoggingInAgain ? 'Logging out...' : 'Log in again'}
          </a>
        </li>
      </ol>
      <p className={styles.contact}>
        If the problem continues, please contact us at
        info@highlandsmusicfestival.ca.
      </p>
    </Takeover>
  );
}
