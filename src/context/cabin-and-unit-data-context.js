import { createContext, useContext } from 'react';

const CabinAndUnitData = createContext();

export const useCabinAndUnitData = () => useContext(CabinAndUnitData);

export const CabinAndUnitDataProvider = ({ children, cabinAndUnitData }) => {
  return (
    <CabinAndUnitData.Provider value={cabinAndUnitData}>
      {children}
    </CabinAndUnitData.Provider>
  );
};
