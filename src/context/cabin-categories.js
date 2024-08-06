import useGetCabinCategories from '@/hooks/useGetCabinCategories';
import { createContext, useContext } from 'react';

const CabinCategories = createContext();

export const useCabinCategories = () => useContext(CabinCategories);

export const CabinCategoriesProvider = ({ children }) => {
  const cabinCategoryData = useGetCabinCategories();
  return (
    <CabinCategories.Provider value={cabinCategoryData}>
      {children}
    </CabinCategories.Provider>
  );
};
