import { FILTERS } from '../../../filters/filters-context';

const { AVAILABLE_BEDS } = FILTERS;

export const filterByCategory = ({ cabins, selectedFilters }) => {
  const categoryFilterSelection = selectedFilters[FILTERS.CATEGORY];
  if (!categoryFilterSelection) return cabins;
  return cabins.filter(({ category }) => {
    if (!categoryFilterSelection) return true;
    if (category && category[0] && categoryFilterSelection === category[0])
      return true;
    return false;
  });
};

export const filterByAvailableBeds = ({ cabins, selectedFilters }) => {
  const availableBedsFilter = selectedFilters[AVAILABLE_BEDS];
  if (!availableBedsFilter) return cabins;
  return cabins.filter(({ openBeds, availability }) => {
    if (
      availableBedsFilter &&
      openBeds >= availableBedsFilter &&
      availability === 'Open'
    )
      return true;
    if (!availableBedsFilter && openBeds >= availableBedsFilter) return true;
    return false;
  });
};

export const sortByLeastAvailability = ({ cabins }) => {
  const sortedByOpenBeds = cabins.sort((a, b) => {
    const aOpenBeds = parseFloat(a.openBeds);
    const bOpenBeds = parseFloat(b.openBeds);
    if (aOpenBeds > bOpenBeds) return -1;
    return 1;
  });
  return sortedByOpenBeds.sort((a, b) => {
    if (a.availability === 'Open') return -1;
    return 1;
  });
};

export const filterOutClosedCabins = ({ cabins }) => {
  return cabins.filter(({ availability }) => {
    if (availability !== 'Open') return false;
    return true;
  });
};
