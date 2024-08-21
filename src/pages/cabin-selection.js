import { FiltersProvider } from '@/components/cabinSelectionPage/filters/filters-context';
import CabinSelectionContainer from '@/components/cabinSelectionPage/cabinSelectionContainer/cabinSelectionContainer';
import Layout from '@/components/shared/layout/layout';
import { CabinSelectionProvider } from '@/context/cabin-selection-context';
import { CabinAndUnitDataProvider } from '@/context/cabin-and-unit-data-context';
import { ReservationProvider } from '@/context/reservation-context';
import { CabinCategoriesProvider } from '@/context/cabin-categories';
import { UserProvider } from '@/context/user-context';

export default function CabinSelection() {
  return (
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
  );
}
