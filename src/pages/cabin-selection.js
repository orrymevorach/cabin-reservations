import { FiltersProvider } from '@/components/cabinSelectionPage/filters/filters-context';
import CabinSelectionContainer from '@/components/cabinSelectionPage/cabinSelectionContainer/cabinSelectionContainer';
import Layout from '@/components/shared/layout/layout';
import { CabinSelectionProvider } from '@/context/cabin-selection-context';
import { CabinAndUnitDataProvider } from '@/context/cabin-and-unit-data-context';
import { ReservationProvider } from '@/context/reservation-context';
import { CabinCategoriesProvider } from '@/context/cabin-categories';
import { UserProvider } from '@/context/user-context';
import VisibleSectionProvider from '@/context/visible-section-context';
import Takeover from '@/components/shared/takeover/takeover';
import Button from '@/components/shared/button/button';
import { ROUTES } from '@/utils/constants';

import getCabinAndUnitData from '@/hooks/useGetCabinAndUnitData';
import {
  getBedOccupant,
  getGroup,
  getPageLoadData,
  getUserByRecordId,
} from '@/lib/airtable';
import { BEDS } from '@/utils/constants';
import SelectCabinTakeover from '@/components/reservePage/selectCabinTakeover/selectCabinTakeover';

export default function CabinSelection({
  cabinAndUnitData,
  user,
  group,
  selectedBeds,
  hasCabin,
}) {
  return (
    <Takeover hideCloseButton>
      <p style={{ marginBottom: '20px' }}>
        Cabin selection is not currently available. We will send out an email to
        all ticket holders when cabin reservations open up.
      </p>
      <Button href={ROUTES.SUMMARY}>Reservation Summary</Button>
    </Takeover>
  );
  if (!hasCabin) return <SelectCabinTakeover />;
  return (
    <VisibleSectionProvider>
      <CabinAndUnitDataProvider cabinAndUnitData={cabinAndUnitData}>
        <UserProvider user={user}>
          <ReservationProvider
            cabinAndUnitData={cabinAndUnitData}
            user={user}
            group={group}
            selectedBeds={selectedBeds}
          >
            <CabinSelectionProvider>
              <FiltersProvider>
                <CabinCategoriesProvider>
                  <Layout>
                    <main>
                      <CabinSelectionContainer />
                    </main>
                  </Layout>
                </CabinCategoriesProvider>
              </FiltersProvider>
            </CabinSelectionProvider>
          </ReservationProvider>
        </UserProvider>
      </CabinAndUnitDataProvider>
    </VisibleSectionProvider>
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

  const selectedBeds = [];
  const bedsArray = Object.keys(BEDS);
  for (let bed of bedsArray) {
    if (currentCabin[bed] && currentCabin[bed][0]) {
      const currentBedOccupant = await getBedOccupant({
        userId: currentCabin[bed][0],
      });
      currentCabin[bed] = currentBedOccupant;
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
        group: groupMembers,
      },
      group: {
        id: groupId,
        members: groupMembers,
      },
      selectedBeds,
      hasCabin: true,
    },
  };
}
