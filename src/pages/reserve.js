import ReservePage from '@/components/reservePage/reservePage';
import { CabinAndUnitDataProvider } from '@/context/cabin-and-unit-data-context';
import { ReservationProvider } from '@/context/reservation-context';
import { UserProvider } from '@/context/user-context';

export default function Reserve() {
  return (
    <CabinAndUnitDataProvider>
      <UserProvider>
        <ReservationProvider>
          <ReservePage />
        </ReservationProvider>
      </UserProvider>
    </CabinAndUnitDataProvider>
  );
}
