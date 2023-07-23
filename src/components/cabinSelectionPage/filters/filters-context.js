import { createContext, useState, useContext } from 'react';

const FiltersContext = createContext('');

const useFilters = () => {
  const context = useContext(FiltersContext);
  return context;
};

const FILTERS = {
  AVAILABLE_BEDS: 'Available beds',
  UNIT: 'Unit',
  GENDER: 'Gender',
};

const GENDER_LABELS = {
  MALE: 'Male only',
  FEMALE: 'Female only',
  MIXED: 'Mixed',
};

const { AVAILABLE_BEDS, UNIT, GENDER } = FILTERS;

const initialState = {
  [AVAILABLE_BEDS]: null,
  [UNIT]: null,
  [GENDER]: null,
};

const FiltersProvider = ({ children }) => {
  const [selectedFilters, setSelectedFilters] = useState(initialState);
  const value = {
    selectedFilters,
    setSelectedFilters,
  };
  return (
    <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>
  );
};

export { FiltersProvider, useFilters, FILTERS, GENDER_LABELS };
