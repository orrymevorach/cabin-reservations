import CheckIn from '@/components/checkIn/checkIn';
import { CheckInProvider } from '@/context/check-in-context';
import { getUserByRecordId, getUserCabin } from '@/lib/airtable';
import { logSentryError } from '@/utils/sentry-utils';

export default function CheckInPage({ user }) {
  return (
    <CheckInProvider>
      <CheckIn user={user} />
    </CheckInProvider>
  );
}

export async function getServerSideProps(context) {
  let user;
  let cabin = null;
  const queryId = Array.isArray(context.query.id)
    ? context.query.id[0]
    : context.query.id;
  // remove appended 2026
  const userId = queryId?.split('_')[0];
  try {
    if (!userId) throw new Error('Missing check-in user id.');
    const userResponse = await getUserByRecordId({ id: userId });
    user = userResponse;
    cabin = await getUserCabin(user);
  } catch (error) {
    logSentryError(error, {
      action: 'check-in-page-load',
      queryId,
      userId,
    });
    console.error('No user data found:', error);
    user = null;
  }
  if (!user) {
    return {
      props: { user: null },
    };
  }

  return {
    props: {
      user: {
        name: user.name || '',
        isCheckedIn: user.checkedIn || false,
        email: user.emailAddress || '',
        id: user.id || '',
        cabin,
        userRecordId: user.recordId,
      },
    },
  };
}
