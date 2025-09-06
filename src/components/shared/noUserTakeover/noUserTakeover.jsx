import Link from 'next/link';
import Takeover from '../takeover/takeover';
import { ROUTES } from '@/utils/constants';
import styles from './noUserTakeover.module.scss';

export default function NoUserTakeover() {
  return (
    <Takeover modalClassNames={styles.modal} hideCloseButton>
      <div className={styles.container}>
        <p className={styles.title}>
          Oh No! There was an error logging you again.
        </p>
        <p className={styles.instruction}>Please try the following:</p>
        <ol className={styles.list}>
          <li>
            If you have not yet purchased a ticket, please{' '}
            <a
              href="https://highlandsmusicfestival.ca/buy-tickets"
              target="_blank"
              className={styles.link}
            >
              buy a ticket
            </a>{' '}
            and try logging in again.
          </li>
          <li>
            If you have already purchased a ticket, please try{' '}
            <Link href={ROUTES.HOME} className={styles.link}>
              logging in
            </Link>{' '}
            again. <br />
            <span className={styles.note}>
              (Make sure you are logging in with the email you used to purchase
              the ticket.)
            </span>
          </li>
        </ol>
        <p className={styles.contact}>
          If you require any assistance, please contact us at
          info@highlandsmusicfestival.ca.
        </p>
      </div>
    </Takeover>
  );
}
