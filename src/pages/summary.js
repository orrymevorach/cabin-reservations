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
import SelectCabinTakeover from '@/components/reservePage/selectCabinTakeover/selectCabinTakeover';

export default function Summary({
  cabinAndUnitData,
  user,
  group,
  selectedBeds,
  hasCabin,
}) {
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
  const { user } = await getPageLoadData(context);
  const cabin = user.cabin;
  if (!cabin) {
    return {
      props: {
        hasCabin: false,
      },
    };
  }

  const cabinAndUnitData = await getCabinAndUnitData();

  const currentCabin = cabinAndUnitData.cabins.find(cabin => {
    return cabin.id === user.cabin[0];
  });

  const group = await getGroup({ groupId: user.group });
  const groupWithMemberData = await Promise.all(
    group.members.map(async memberId => {
      const member = await getUserByRecordId({ id: memberId });
      return member;
    })
  );
  const selectedBeds = [];
  const bedsArray = Object.keys(BEDS);
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
      user: {
        ...user,
        cabin: currentCabin,
      },
      group: {
        id: user.group[0],
        members: groupWithMemberData,
      },
      selectedBeds,
      hasCabin: true,
    },
  };
}
