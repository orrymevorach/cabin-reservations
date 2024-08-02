import { FiltersProvider } from '@/components/cabinSelectionPage/filters/filters-context';
import CabinSelectionContainer from '@/components/cabinSelectionPage/cabinSelectionContainer/cabinSelectionContainer';
import Layout from '@/components/shared/layout/layout';
import { CabinSelectionProvider } from '@/context/cabin-selection-context';
import { CabinAndUnitDataProvider } from '@/context/cabin-and-unit-data-context';
import { ReservationProvider } from '@/context/reservation-context';

export default function CabinSelection() {
  return (
    <ReservationProvider>
      <CabinAndUnitDataProvider>
        <CabinSelectionProvider>
          <FiltersProvider>
            <Layout>
              <main>
                <CabinSelectionContainer />
              </main>
            </Layout>
          </FiltersProvider>
        </CabinSelectionProvider>
      </CabinAndUnitDataProvider>
    </ReservationProvider>
  );
}
