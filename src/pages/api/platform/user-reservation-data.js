import getCabinAndUnitData from '@/lib/cabins';
import { getPageLoadData, getUserByRecordId } from '@/lib/airtable';
import { getUserReservationData } from '@/lib/cabin-selection';
import { isObjectEmpty } from '@/utils/string-utils';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { userId: queryUserId = null } = req.query;

    let user = null;
    if (queryUserId) {
      const candidate = await getUserByRecordId({ id: queryUserId });
      user = isObjectEmpty(candidate) ? null : candidate;
    } else {
      const pageLoadResponse = await getPageLoadData({ req, res });
      user = pageLoadResponse.user;
    }

    if (!user) return res.status(200).json({ user: null });

    const cabinAndUnitData = await getCabinAndUnitData();
    const { user: resolvedUser, group, selectedBeds } =
      await getUserReservationData({ user, cabinAndUnitData });

    res
      .status(200)
      .json({ cabinAndUnitData, user: resolvedUser, group, selectedBeds });
  } catch (err) {
    console.log('error', err);
    res.status(err.statusCode || 500).json({ message: err.message });
  }
}
