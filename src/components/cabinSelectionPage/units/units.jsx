import { useCabinAndUnitData } from '@/context/cabin-and-unit-data-context';
import UnitRow from './unitRow';
import { FILTERS, useFilters } from '../filters/filters-context';

export default function Units() {
  const { units } = useCabinAndUnitData();
  const { selectedFilters } = useFilters();
  const { UNIT } = FILTERS;
  const unitFilter = selectedFilters[UNIT];
  return (
    <>
      {units
        .filter(unitData => {
          if (!unitFilter) return true;
          if (unitData.name === unitFilter || unitFilter === 'All') return true;
          return false;
        })
        .map(unitData => {
          return <UnitRow key={unitData.name} unitData={unitData} />;
        })}
    </>
  );
}
