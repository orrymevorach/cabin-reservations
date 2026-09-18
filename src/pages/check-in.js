import CheckIn from '@/components/checkIn/checkIn';
import { CheckInProvider } from '@/context/check-in-context';
import { getUserByRecordId } from '@/lib/airtable';

export default function CheckInPage({ user }) {
  return (
    <CheckInProvider>
      <CheckIn user={user} />
    </CheckInProvider>
  );
}

export async function getServerSideProps(context) {
  let user;
  const queryId = Array.isArray(context.query.id)
    ? context.query.id[0]
    : context.query.id;
  // remove appended 2026
  const userId = queryId?.split('_')[0];
  try {
    if (!userId) throw new Error('Missing check-in user id.');
    const userResponse = await getUserByRecordId({ id: userId });
    user = userResponse;
  } catch (error) {
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
      },
    },
  };
}
