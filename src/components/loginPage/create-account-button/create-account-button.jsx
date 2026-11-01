import Link from 'next/link';
import styles from './create-account-button.module.scss';
import { ROUTES } from '@/utils/constants';
import { useRouter } from 'next/router';

export default function CreateAccountButton() {
  const router = useRouter();
  const accountHref =
    router.query.returnTo === ROUTES.DIETARY_INTAKE
      ? {
          pathname: ROUTES.CREATE_ACCOUNT,
          query: { returnTo: ROUTES.DIETARY_INTAKE },
        }
      : ROUTES.CREATE_ACCOUNT;
  return (
    <>
      <Link href={accountHref} className={styles.link}>
        Create an account.
      </Link>
    </>
  );
}
