import { useEffect, useState } from 'react';
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

export default function useGetCabinAndUnitData() {
  const [units, setUnits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const getData = async () => {
      const cabinResponse = await getCabins({});
      const unitResponse = await getUnits({});
      const unitsWithAllCabins = sortCabinsIntoUnits({
        units: unitResponse,
        cabins: cabinResponse,
      });
      setUnits(unitsWithAllCabins);
      console.log('setting is loading to false');
      setIsLoading(false);
    };

    if (!units.length) {
      console.log('level 1');
      getData();
    }
  }, [units.length]);

  console.log('isLoading', isLoading);

  return {
    units,
    isLoading,
  };
}
