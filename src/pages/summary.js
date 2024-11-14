import Layout from '@/components/shared/layout/layout';
import { ReservationProvider } from '@/context/reservation-context';
import SummaryPage from '@/components/summaryPage/summaryPage';
import { CabinAndUnitDataProvider } from '@/context/cabin-and-unit-data-context';
import { UserProvider } from '@/context/user-context';
import getCabinAndUnitData from '@/hooks/useGetCabinAndUnitData';
import {
  getBedOccupant,
  getGroup,
  getPageLoadData,
  getUserByRecordId,
} from '@/lib/airtable';
import { BEDS } from '@/utils/constants';

export default function Summary({
  cabinAndUnitData,
  user,
  group,
  selectedBeds,
}) {
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
  const cabinAndUnitData = await getCabinAndUnitData();
  const { user } = await getPageLoadData(context);
  const group = await getGroup({ groupId: user.group });
  const groupWithMemberData = await Promise.all(
    group.members.map(async memberId => {
      const member = await getUserByRecordId({ id: memberId });
      return member;
    })
  );
  const selectedBeds = [];
  const bedsArray = Object.keys(BEDS);
  const cabin = user.cabin;
  for (let bed of bedsArray) {
    if (cabin[bed] && cabin[bed][0]) {
      const currentBedOccupant = await getBedOccupant({
        userId: cabin[bed][0],
      });
      selectedBeds.push({
        bedName: bed,
        ...currentBedOccupant,
      });
    }
  }

  return {
    props: {
      cabinAndUnitData,
      user,
      group: {
        id: user.group[0],
        members: groupWithMemberData,
      },
      selectedBeds,
    },
  };
}
