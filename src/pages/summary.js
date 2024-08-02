import Layout from '@/components/shared/layout/layout';
import { ReservationProvider } from '@/context/reservation-context';
import SummaryPage from '@/components/summaryPage/summaryPage';
import { CabinAndUnitDataProvider } from '@/context/cabin-and-unit-data-context';

export default function Summary() {
  return (
    <CabinAndUnitDataProvider>
      <ReservationProvider>
        <Layout>
          <SummaryPage />
        </Layout>
      </ReservationProvider>
    </CabinAndUnitDataProvider>
  );
}
