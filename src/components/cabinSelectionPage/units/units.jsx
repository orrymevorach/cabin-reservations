import { useCabinAndUnitData } from '@/context/cabin-and-unit-data-context';
import UnitRow from './unitRow/unitRow';
import { FILTERS, useFilters } from '../filters/filters-context';
import {
  filterByAvailableBeds,
  filterByCategory,
  sortByLeastAvailability,
} from './unitRow/cabinList/filter-utils';

const filterByFilterSelection = ({ cabins, selectedFilters }) => {
  let filteredCabins = [];
  filteredCabins = filterByAvailableBeds({ cabins, selectedFilters });
  filteredCabins = filterByCategory({
    cabins: filteredCabins,
    selectedFilters,
  });
  filteredCabins = sortByLeastAvailability({ cabins: filteredCabins });
  return filteredCabins;
};

export const sortAndFilterUnits = ({
  unitData,
  unitFilter,
  selectedFilters,
}) => {
  return unitData
    .filter(unitData => {
      // filter based on unit filter
      if (!unitFilter) return true;
      if (unitData.name === unitFilter || unitFilter === 'All') return true;
      return false;
    })
    .sort((a, b) => {
      // move units with higher cabin count higher on the list
      const aCabins = filterByFilterSelection({
        cabins: a.cabins,
        selectedFilters,
      });
      const bCabins = filterByFilterSelection({
        cabins: b.cabins,
        selectedFilters,
      });
      if (aCabins > bCabins) return -1;
      return 1;
    });
};

export default function Units() {
  const { units } = useCabinAndUnitData();
  const { selectedFilters } = useFilters();
  const { UNIT } = FILTERS;
  const unitFilter = selectedFilters[UNIT];
  const sortedUnits = sortAndFilterUnits({
    unitData: units,
    unitFilter,
    selectedFilters,
  });

  return (
    <>
      {sortedUnits.map(unitData => {
        const unitCopy = { ...unitData };
        const cabins = filterByFilterSelection({
          cabins: unitCopy.cabins,
          selectedFilters,
        });
        unitCopy.cabins = cabins;
        return <UnitRow key={unitData.name} unitData={unitCopy} />;
      })}
    </>
  );
}
