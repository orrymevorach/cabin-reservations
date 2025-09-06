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
import styles from '../components/shared/countdown/countdown.module.scss';

import getCabinAndUnitData from '@/hooks/useGetCabinAndUnitData';
import {
  getBedOccupant,
  getGroup,
  getPageLoadData,
  getUserByRecordId,
} from '@/lib/airtable';
import { BEDS } from '@/utils/constants';
import CountdownTo11AM from '@/components/shared/countdown/countdown';

export default function CabinSelection({
  cabinAndUnitData,
  user,
  group,
  selectedBeds,
}) {
  // const isProduction =
  //   process.env.NODE_ENV === 'production' &&
  //   process.env.NEXT_PUBLIC_ENV_URL !==
  //     'https://staging--highlands-reservations.netlify.app/';
  // if (isProduction)
  //   return (
  //     <>
  //       <Takeover hideCloseButton modalClassNames={styles.modal}>
  //         <CountdownTo11AM />
  //         {/* <p style={{ marginBottom: '20px' }}>
  //         Cabin selection is not currently available. We will send out an email
  //         to all ticket holders when cabin reservations open up.
  //       </p> */}
  //       </Takeover>
  //     </>
  //   );
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
  let user;
  try {
    const pageLoadResponse = await getPageLoadData(context);
    user = pageLoadResponse.user;
  } catch (error) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const cabinAndUnitData = await getCabinAndUnitData();

  let currentCabin = null;
  const selectedBeds = [];

  if (user.cabin) {
    currentCabin = cabinAndUnitData.cabins.find(
      cabin => cabin.id === user.cabin[0]
    );
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
  }

  let groupMembers = [];
  let groupId = '';

  if (user.group && user.group.length > 0) {
    groupId = user.group[0] || '';
    const groupResponse = await getGroup({ groupId });
    if (groupResponse?.members) {
      groupMembers = await Promise.all(
        groupResponse.members.map(async memberId => {
          const member = await getUserByRecordId({ id: memberId });
          return member;
        })
      );
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
    },
  };
}
