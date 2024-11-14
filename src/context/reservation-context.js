import { useReservationReducer } from '@/hooks/useReservation';
import { createContext, useContext } from 'react';

const ReservationContext = createContext();

export const useReservation = () => useContext(ReservationContext);

export const ReservationProvider = ({
  children,
  cabinAndUnitData,
  user,
  group,
  selectedBeds,
}) => {
  const reservationReducer = useReservationReducer({
    cabinAndUnitData,
    user,
    group,
    selectedBeds,
  });
  return (
    <ReservationContext.Provider value={reservationReducer}>
      {children}
    </ReservationContext.Provider>
  );
};
