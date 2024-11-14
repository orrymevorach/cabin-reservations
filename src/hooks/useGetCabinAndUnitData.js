import { getCabins, getUnits } from '@/lib/airtable';

const sortCabinsIntoUnits = ({ units, cabins }) => {
  return (
    units
      // filter out closed units
      .filter(({ availability }) => {
        if (availability === 'Open') return true;
        return false;
      })
      // map cabin data from cabin response to unit response
      .map(unit => {
        const cabinIdsInUnit = unit.cabins;
        if (!cabinIdsInUnit) return unit;
        const cabinsWithData = cabinIdsInUnit.map(cabinId =>
          cabins.find(({ id }) => id === cabinId)
        );
        unit.cabins = cabinsWithData;
        return unit;
      })
  );
};

export default async function getCabinAndUnitData() {
  const cabinResponse = await getCabins({});
  const unitResponse = await getUnits({});
  const unitsWithAllCabins = sortCabinsIntoUnits({
    units: unitResponse,
    cabins: cabinResponse,
  });

  return {
    units: unitsWithAllCabins,
    cabins: cabinResponse,
  };
}
