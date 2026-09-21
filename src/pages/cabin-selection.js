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
import getCabinAndUnitData from '@/lib/platform-api';
import { getPageLoadData } from '@/lib/airtable';
import { getUserReservationData } from '@/lib/platform-utils';
import { FEATURE_FLAGS, ROUTES } from '@/utils/constants';
import NoUserTakeover from '@/components/shared/noUserTakeover/noUserTakeover';
import CountdownToDate from '@/components/shared/countdown/countdown';
import Link from 'next/link';

export default function CabinSelection({
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
        <p>
          If you have purchased a cabin,{' '}
          <Link href={ROUTES.SUMMARY}>click here</Link> to manage your
          reservation.
        </p>
      </Takeover>
    );

  if (!user) return <NoUserTakeover />;

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
    console.error('No user data found:', error);
    user = null;
  }
  if (!user) {
    return {
      props: { user: null },
    };
  }

  const cabinAndUnitData = await getCabinAndUnitData();
  const {
    user: resolvedUser,
    group,
    selectedBeds,
  } = await getUserReservationData({ user, cabinAndUnitData });

  return {
    props: {
      cabinAndUnitData,
      user: resolvedUser,
      group,
      selectedBeds,
    },
  };
}
