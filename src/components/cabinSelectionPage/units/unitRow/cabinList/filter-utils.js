import { GENDER_LABELS, FILTERS } from '../../../filters/filters-context';

const { AVAILABLE_BEDS, GENDER } = FILTERS;

export const filterByGender = ({ cabins, selectedFilters }) => {
  const genderFilter = selectedFilters[GENDER];
  const { MALE, FEMALE, MIXED } = GENDER_LABELS;
  return cabins.filter(({ additionalInformation }) => {
    if (!additionalInformation || !genderFilter || genderFilter === MIXED)
      return true;
    const isMaleCabin = additionalInformation.includes(MALE);
    const isFemaleCabin = additionalInformation.includes(FEMALE);
    if (isMaleCabin && genderFilter === MALE) return true;
    if (isFemaleCabin && genderFilter === FEMALE) return true;
    return false;
  });
};

export const filterByAvailableBeds = ({ cabins, selectedFilters }) => {
  const availableBedsFilter = selectedFilters[AVAILABLE_BEDS];
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
  return cabins.sort((a, b) => {
    const aOpenBeds = parseFloat(a.openBeds);
    const bOpenBeds = parseFloat(b.openBeds);
    if (aOpenBeds > bOpenBeds) return 1;
    return -1;
  });
};

export const filterOutClosedCabins = ({ cabins }) => {
  return cabins.filter(({ availability }) => {
    if (availability !== 'Open') return false;
    return true;
  });
};
