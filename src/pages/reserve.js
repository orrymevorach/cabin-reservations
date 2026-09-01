import ReservePage from '@/components/reservePage/reservePage';
import SelectCabinTakeover from '@/components/reservePage/selectCabinTakeover/selectCabinTakeover';
import Button from '@/components/shared/button/button';
import Takeover from '@/components/shared/takeover/takeover';
import { CabinAndUnitDataProvider } from '@/context/cabin-and-unit-data-context';
import { ReservationProvider } from '@/context/reservation-context';
import { UserProvider } from '@/context/user-context';
import getCabinAndUnitData from '@/lib/platform-api';
import { getPageLoadData } from '@/lib/airtable';
import { getUserReservationData } from '@/lib/platform-utils';
import { FEATURE_FLAGS, ROUTES } from '@/utils/constants';
import styles from '../components/shared/countdown/countdown.module.scss';
import CountdownToDate from '@/components/shared/countdown/countdown';
import NoUserTakeover from '@/components/shared/noUserTakeover/noUserTakeover';
import Link from 'next/link';

export default function Reserve({
  cabinAndUnitData,
  user,
  group,
  selectedBeds,
  hasCabinQuery = false,
}) {
  if (!hasCabinQuery) return <SelectCabinTakeover />;
  const { ENABLE_COUNTDOWN, ENABLE_RESERVATIONS } = FEATURE_FLAGS;
  if (ENABLE_COUNTDOWN) return <CountdownToDate />;
  if (!ENABLE_RESERVATIONS)
    return (
      <Takeover hideCloseButton modalClassNames={styles.modal}>
        <p>
          Cabin selection is not currently available. We will send out an email
          to all ticket holders when cabin reservations open up.
        </p>
        <p>
          If you have purchased a cabin,{' '}
          <Link href={ROUTES.SUMMARY}>click here</Link> to manage your
          reservation.
        </p>
      </Takeover>
    );

  if (!user) return <NoUserTakeover />;

  return (
    <CabinAndUnitDataProvider cabinAndUnitData={cabinAndUnitData}>
      <UserProvider user={user}>
        <ReservationProvider
          cabinAndUnitData={cabinAndUnitData}
          user={user}
          group={group}
          selectedBeds={selectedBeds}
        >
          <ReservePage />
        </ReservationProvider>
      </UserProvider>
    </CabinAndUnitDataProvider>
  );
}

export async function getServerSideProps(context) {
  const cabinQuery = context.query.cabin || null;
  if (!cabinQuery) return { props: { hasCabinQuery: false } };
  let user;
  try {
    const pageLoadResponse = await getPageLoadData(context);
    user = pageLoadResponse.user;
  } catch (error) {
    console.error('No user data found:', error);
    user = null;
  }
  if (!user) {
    return {
      props: { user: null, hasCabinQuery: true },
    };
  }

  const cabinAndUnitData = await getCabinAndUnitData();
  const {
    user: resolvedUser,
    group,
    selectedBeds,
  } = await getUserReservationData({ user, cabinAndUnitData });

  // a user without a formal group yet still counts as a group of themselves
  const groupWithSelfFallback = group.members.length
    ? group
    : { ...group, members: [resolvedUser] };

  return {
    props: {
      cabinAndUnitData,
      user: { ...resolvedUser, group: groupWithSelfFallback.members },
      group: groupWithSelfFallback,
      selectedBeds,
      hasCabinQuery: true,
    },
  };
}
