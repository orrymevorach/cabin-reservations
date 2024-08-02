import useCheckInReducer from '@/components/checkIn/useCheckInReducer';
import { createContext, useContext } from 'react';

const CheckInContext = createContext();

export const useCheckIn = () => useContext(CheckInContext);

export const CheckInProvider = ({ children }) => {
  const checkInReducer = useCheckInReducer();
  return (
    <CheckInContext.Provider value={checkInReducer}>
      {children}
    </CheckInContext.Provider>
  );
};
