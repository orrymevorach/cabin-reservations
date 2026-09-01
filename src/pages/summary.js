import Layout from '@/components/shared/layout/layout';
import { ReservationProvider } from '@/context/reservation-context';
import SummaryPage from '@/components/summaryPage/summaryPage';
import { CabinAndUnitDataProvider } from '@/context/cabin-and-unit-data-context';
import { UserProvider } from '@/context/user-context';
import getCabinAndUnitData from '@/lib/platform-api';
import { getPageLoadData } from '@/lib/airtable';
import { getUserReservationData } from '@/lib/platform-utils';
import SelectCabinTakeover from '@/components/reservePage/selectCabinTakeover/selectCabinTakeover';
import NoUserTakeover from '@/components/shared/noUserTakeover/noUserTakeover';

export default function Summary({
  cabinAndUnitData,
  user,
  group,
  selectedBeds,
  hasCabin,
}) {
  if (!user) return <NoUserTakeover />;
  if (!hasCabin) return <SelectCabinTakeover />;
  return (
    <CabinAndUnitDataProvider cabinAndUnitData={cabinAndUnitData}>
      <UserProvider user={user}>
        <ReservationProvider
          cabinAndUnitData={cabinAndUnitData}
          user={user}
          group={group}
          selectedBeds={selectedBeds}
        >
          <Layout>
            <SummaryPage />
          </Layout>
        </ReservationProvider>
      </UserProvider>
    </CabinAndUnitDataProvider>
  );
}

export async function getServerSideProps(context) {
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
      props: { user: null },
    };
  }

  const cabin = user.cabin;
  if (!cabin) {
    return {
      props: {
        hasCabin: false,
      },
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
      hasCabin: true,
    },
  };
}
