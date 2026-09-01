// shared cabin filter/sort logic used by both the API route and client components
export const isHeadStaffCabin = cabin => !!cabin?.name?.includes('Head Staff');

export const filterOutHeadStaffCabins = ({ cabins }) =>
  cabins.filter(cabin => !isHeadStaffCabin(cabin));

export const filterOutClosedCabins = ({ cabins }) =>
  cabins.filter(({ availability }) => availability === 'Open');

export const filterByCategory = ({ cabins, category }) => {
  if (!category) return cabins;
  return cabins.filter(
    ({ category: cabinCategory }) =>
      cabinCategory && cabinCategory[0] === category,
  );
};

export const filterByAvailableBeds = ({ cabins, availableBeds }) => {
  if (!availableBeds) return cabins;
  return cabins.filter(
    ({ openBeds, availability }) =>
      openBeds >= availableBeds && availability === 'Open',
  );
};

export const sortByLeastAvailability = ({ cabins }) => {
  return [...cabins]
    .sort((a, b) => parseFloat(b.openBeds) - parseFloat(a.openBeds))
    .sort((a, b) => (a.availability === 'Open' ? -1 : 1));
};

const getCategoryPriority = cabin => {
  if (!cabin.category || !cabin.category[0]) return 3; // lowest priority
  if (cabin.category[0] === 'Female only') return 0; // highest priority
  if (cabin.category[0] === 'Anywhere!') return 2; // middle-low
  return 1; // normal categories
};

export const sortByCategory = ({ cabins }) =>
  [...cabins].sort((a, b) => getCategoryPriority(a) - getCategoryPriority(b));
