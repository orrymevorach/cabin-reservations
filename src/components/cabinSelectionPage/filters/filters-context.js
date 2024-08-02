import { createContext, useState, useContext } from 'react';

const FiltersContext = createContext('');

const useFilters = () => {
  const context = useContext(FiltersContext);
  return context;
};

const FILTERS = {
  AVAILABLE_BEDS: 'Available beds',
  UNIT: 'Unit',
  CATEGORY: 'Category',
};

const { AVAILABLE_BEDS, UNIT, CATEGORY } = FILTERS;

const initialState = {
  [AVAILABLE_BEDS]: null,
  [UNIT]: null,
  [CATEGORY]: null,
};

const FiltersProvider = ({ children }) => {
  const [selectedFilters, setSelectedFilters] = useState(initialState);
  const value = {
    selectedFilters,
    setSelectedFilters,
    initialState,
  };
  return (
    <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>
  );
};

export { FiltersProvider, useFilters, FILTERS, initialState };
