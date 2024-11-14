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

export default function CabinSelection() {
  return (
    <Takeover hideCloseButton>
      <p style={{ marginBottom: '20px' }}>
        Cabin selection is not currently available. We will send out an email to
        all ticket holders when cabin reservations open up.
      </p>
      <Button href={ROUTES.SUMMARY}>Reservation Summary</Button>
    </Takeover>
  );
  return (
    <VisibleSectionProvider>
      <CabinAndUnitDataProvider>
        <UserProvider>
          <ReservationProvider>
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
