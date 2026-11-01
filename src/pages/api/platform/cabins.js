import { logSentryApiError } from '@/utils/sentry-utils';
import { getCabins, getUnits } from '@/lib/airtable';
import {
  filterOutClosedCabins,
  filterOutHeadStaffCabins,
  sortByCategory,
  sortByLeastAvailability,
} from '@/utils/cabin-utils';

const sortCabinsIntoUnits = ({ units, cabins }) => {
  return filterOutClosedCabins({ cabins: units }).map(unit => {
    const cabinIdsInUnit = unit.cabins;
    if (!cabinIdsInUnit) return unit;
    const cabinsWithData = cabinIdsInUnit
      .map(cabinId => cabins.find(({ id }) => id === cabinId))
      .filter(Boolean);
    unit.cabins = filterOutHeadStaffCabins({ cabins: cabinsWithData });
    return unit;
  });
};

const sortCabins = ({ cabins }) => {
  let sortedCabins = sortByLeastAvailability({ cabins });
  sortedCabins = sortByCategory({ cabins: sortedCabins });
  return sortedCabins;
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  // supports linking directly to a specific unit's cabins (web only)
  const { unit = null } = req.query;

  try {
    const cabinResponse = await getCabins({});
    const unitResponse = await getUnits({});
    const unitsWithAllCabins = sortCabinsIntoUnits({
      units: unitResponse,
      cabins: cabinResponse,
    });

    const filteredUnits = unitsWithAllCabins
      .filter(unitData => {
        if (!unit) return true;
        return unitData.name === unit || unit === 'All';
      })
      .map(unitData => ({
        ...unitData,
        cabins: sortCabins({ cabins: unitData.cabins }),
      }))
      // units with more available cabins are shown first
      .sort((a, b) => b.cabins.length - a.cabins.length);

    res.status(200).json({ units: filteredUnits, cabins: cabinResponse });
  } catch (err) {
    await logSentryApiError({
      error: err,
      req,
      action: 'load-cabins',
      extra: { unit: req.query?.unit },
    });
    res.status(err.statusCode || 500).json({ message: err.message });
  }
}
