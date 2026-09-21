import { FILTERS } from '../../../filters/filters-context';
import {
  filterByAvailableBeds as filterByAvailableBedsValue,
  filterByCategory as filterByCategoryValue,
  filterOutClosedCabins,
  sortByCategory,
  sortByLeastAvailability,
} from '@/utils/cabin-utils';

export const filterByCategory = ({ cabins, selectedFilters }) =>
  filterByCategoryValue({
    cabins,
    category: selectedFilters[FILTERS.CATEGORY],
  });

export const filterByAvailableBeds = ({ cabins, selectedFilters }) =>
  filterByAvailableBedsValue({
    cabins,
    availableBeds: selectedFilters[FILTERS.AVAILABLE_BEDS],
  });

export { filterOutClosedCabins, sortByCategory, sortByLeastAvailability };
