import { useState } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { COOKIES, ROUTES } from '@/utils/constants';
import { signOutOfFirebase } from '@/components/loginPage/login/firebase-utils';

// Signs the guest out of Firebase and removes every cookie before returning to the login page,
// so a stale user_record_id cookie cannot redirect them straight back to the page that failed.
export default function useLogInAgain() {
  const router = useRouter();
  const [isLoggingInAgain, setIsLoggingInAgain] = useState(false);

  const handleLogInAgain = async event => {
    event?.preventDefault();
    if (isLoggingInAgain) return;
    setIsLoggingInAgain(true);

    try {
      const signOutResponse = await signOutOfFirebase();
      if (signOutResponse?.error) {
        console.error('Unable to sign out of Firebase:', signOutResponse.error);
      }
    } catch (error) {
      console.error('Unable to sign out of Firebase:', error);
    } finally {
      const cookieNames = Object.keys(Cookies.get());
      cookieNames.forEach(cookieName => {
        Cookies.remove(cookieName, { path: '/' });
      });
      Cookies.remove(COOKIES.USER_RECORD, { path: '/' });
      Cookies.remove(COOKIES.UID, { path: '/' });
      await router.replace(ROUTES.HOME);
    }
  };

  return { isLoggingInAgain, handleLogInAgain };
}
