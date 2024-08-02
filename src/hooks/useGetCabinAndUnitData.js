import { useEffect, useState } from 'react';
import { getCabins, getUnits } from '@/lib/airtable';

const sortCabinsIntoUnits = ({ units, cabins }) => {
  return units.map(unit => {
    const cabinIdsInUnit = unit.cabins;
    if (!cabinIdsInUnit) return unit;
    const cabinsWithData = cabinIdsInUnit.map(cabinId =>
      cabins.find(({ id }) => id === cabinId)
    );
    unit.cabins = cabinsWithData;
    return unit;
  });
};

export default function useGetCabinAndUnitData() {
  const [units, setUnits] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    setIsLoading(true);
    const getData = async () => {
      const cabinResponse = await getCabins({});
      const unitResponse = await getUnits({});
      if (!units.length) {
        const unitsWithAllCabins = sortCabinsIntoUnits({
          units: unitResponse,
          cabins: cabinResponse,
        });
        setUnits(unitsWithAllCabins);
      }
      setIsLoading(false);
    };

    getData();
  }, [units.length]);

  return {
    units,
    isLoading,
  };
}
