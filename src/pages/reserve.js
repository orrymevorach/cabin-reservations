import ReservePage from '@/components/reservePage/reservePage';
import SelectCabinTakeover from '@/components/reservePage/selectCabinTakeover/selectCabinTakeover';
import Button from '@/components/shared/button/button';
import Takeover from '@/components/shared/takeover/takeover';
import { CabinAndUnitDataProvider } from '@/context/cabin-and-unit-data-context';
import { ReservationProvider } from '@/context/reservation-context';
import { UserProvider } from '@/context/user-context';
import getCabinAndUnitData from '@/hooks/useGetCabinAndUnitData';
import { getGroup, getPageLoadData, getUserByRecordId } from '@/lib/airtable';
import { FEATURE_FLAGS } from '@/utils/constants';
import styles from '../components/shared/countdown/countdown.module.scss';
import CountdownToDate from '@/components/shared/countdown/countdown';
import NoUserTakeover from '@/components/shared/noUserTakeover/noUserTakeover';

export default function Reserve({
  cabinAndUnitData,
  user,
  group,
  selectedBeds,
}) {
  const { ENABLE_COUNTDOWN, ENABLE_RESERVATIONS } = FEATURE_FLAGS;
  if (ENABLE_COUNTDOWN) return <CountdownToDate />;
  if (!ENABLE_RESERVATIONS)
    return (
      <Takeover hideCloseButton modalClassNames={styles.modal}>
        <p>
          Cabin selection is not currently available. We will send out an email
          to all ticket holders when cabin reservations open up.
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
  } else {
    // If the user has no group, we create a group with just them in it.
    groupId = '';
    groupMembers = [user];
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
