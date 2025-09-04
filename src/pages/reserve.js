import ReservePage from '@/components/reservePage/reservePage';
import SelectCabinTakeover from '@/components/reservePage/selectCabinTakeover/selectCabinTakeover';
import Button from '@/components/shared/button/button';
import Takeover from '@/components/shared/takeover/takeover';
import { CabinAndUnitDataProvider } from '@/context/cabin-and-unit-data-context';
import { ReservationProvider } from '@/context/reservation-context';
import { UserProvider } from '@/context/user-context';
import getCabinAndUnitData from '@/hooks/useGetCabinAndUnitData';
import { getGroup, getPageLoadData, getUserByRecordId } from '@/lib/airtable';
import { ROUTES } from '@/utils/constants';

export default function Reserve({
  cabinAndUnitData,
  user,
  group,
  selectedBeds,
}) {
  const isProduction =
    process.env.NODE_ENV === 'production' &&
    process.env.NEXT_PUBLIC_ENV_URL !==
      'https://staging--highlands-reservations.netlify.app/';
  if (isProduction)
    return (
      <Takeover hideCloseButton>
        <p style={{ marginBottom: '20px' }}>
          Cabin selection is not currently available. We will send out an email
          to all ticket holders when cabin reservations open up.
        </p>
        <Button href={ROUTES.SUMMARY}>Reservation Summary</Button>
      </Takeover>
    );

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
  const { user } = await getPageLoadData(context);

  const cabinAndUnitData = await getCabinAndUnitData();

  let currentCabin = null;
  if (user.cabin) {
    currentCabin = cabinAndUnitData.cabins.find(cabin => {
      return cabin.id === user.cabin[0];
    });
  }

  let groupMembers = [];
  let groupId = '';

  if (user.group) {
    const groupResponse = await getGroup({ groupId: user.group });
    groupId = user.group[0];
    groupMembers = await Promise.all(
      groupResponse.members.map(async memberId => {
        const member = await getUserByRecordId({ id: memberId });
        return member;
      })
    );
  }

  return {
    props: {
      cabinAndUnitData,
      user: {
        ...user,
        cabin: currentCabin,
        group: groupMembers,
      },
      group: {
        id: groupId,
        members: groupMembers,
      },
      hasCabin: true,
    },
  };
}
