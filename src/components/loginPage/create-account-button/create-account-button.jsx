import Link from 'next/link';
import styles from './create-account-button.module.scss';
import { ROUTES } from '@/utils/constants';

export default function CreateAccountButton() {
  return (
    <>
      <Link href={ROUTES.CREATE_ACCOUNT} className={styles.link}>
        Create an account.
      </Link>
    </>
  );
}
