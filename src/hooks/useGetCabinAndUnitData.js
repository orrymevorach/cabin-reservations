import { useEffect, useState } from 'react';
import { getCabins } from '@/lib/airtable';
import { UNITS } from '@/utils/constants';

const initialUnitsData = {
  [UNITS.COLOURS]: {
    cabins: [],
  },
  [UNITS.COMICS]: {
    cabins: [],
  },
  [UNITS.ZODIACS]: {
    cabins: [],
  },
  [UNITS.SEEKERS]: {
    cabins: [],
  },
  Tenting: {
    cabins: [],
  },
  // CITS: {
  //   cabins: [],
  // },
  // 'L-Team': {
  //   cabins: [],
  // },
};

const sortCabinsIntoUnits = (cabinList, initialUnitsData) => {
  for (let cabin of cabinList) {
    const currentUnit = cabin.unit;
    // Some units, such as "Other" in the Airtable DB, are not included in the initial unit data
    const hasUnitData =
      initialUnitsData[currentUnit] && initialUnitsData[currentUnit].cabins;
    if (hasUnitData && !initialUnitsData[currentUnit].cabins.includes(cabin)) {
      initialUnitsData[currentUnit].cabins.push(cabin);
    }
  }
  return initialUnitsData;
};

// This is really ugly - we do it because for some reason every cabin renders twice
const removeDuplicateCabins = unitsWithAllCabins => {
  function removeDuplicatesByKey(array, key) {
    const map = new Map();
    array.forEach(item => {
      if (!map.has(item[key])) {
        map.set(item[key], item);
      }
    });
    return Array.from(map.values());
  }

  const asArray = Object.entries(unitsWithAllCabins);
  return asArray.map(([unitName, { cabins }]) => {
    return [unitName, { cabins: removeDuplicatesByKey(cabins, 'name') }];
  });
};

export default function useGetCabinAndUnitData() {
  const [units, setUnits] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    setIsLoading(true);
    const getData = async () => {
      const cabinResponse = await getCabins({});
      if (!units.length) {
        const unitsWithAllCabins = sortCabinsIntoUnits(
          cabinResponse,
          initialUnitsData
        );
        const unitsWithoutDuplicateCabins =
          removeDuplicateCabins(unitsWithAllCabins);
        setUnits(unitsWithoutDuplicateCabins);
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
